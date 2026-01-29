const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../db/config');
const auth = require('../middleware/auth');
const { table, columns: col } = require('../db/schema');

const router = express.Router();

const OTP_EXPIRY_MINUTES = 10;
const OTP_LENGTH = 6;

function generateOtp() {
  return crypto.randomInt(10 ** (OTP_LENGTH - 1), 10 ** OTP_LENGTH).toString();
}

// Validation helper
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    const existing = await pool.query(
      `SELECT ${col.id} FROM ${table} WHERE ${col.email} = $1`,
      [email.toLowerCase()]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      `INSERT INTO ${table} (${col.email}, ${col.passwordHash}, ${col.name}) VALUES ($1, $2, $3) RETURNING ${col.id}, ${col.email}, ${col.name}, ${col.createdAt}`,
      [email.toLowerCase().trim(), password_hash, (name || '').trim()]
    );

    const user = result.rows[0];
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          created_at: user.created_at,
        },
        accessToken,
        refreshToken,
        expiresIn: 900,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.',
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const result = await pool.query(
      `SELECT ${col.id}, ${col.email}, ${col.passwordHash}, ${col.name}, ${col.createdAt} FROM ${table} WHERE ${col.email} = $1`,
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user[col.passwordHash]);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          created_at: user.created_at,
        },
        accessToken,
        refreshToken,
        expiresIn: 900,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.',
    });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token required.' });
    }
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const result = await pool.query(
      `SELECT ${col.id}, ${col.email}, ${col.name} FROM ${table} WHERE ${col.id} = $1`,
      [decoded.id]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }
    const user = result.rows[0];
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    res.json({
      success: true,
      data: {
        accessToken,
        expiresIn: 900,
        user: { id: user.id, email: user.email, name: user.name },
      },
    });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(403).json({ success: false, message: 'Invalid or expired refresh token.' });
    }
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/auth/me (protected)
router.get('/me', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ${col.id}, ${col.email}, ${col.name}, ${col.createdAt} FROM ${table} WHERE ${col.id} = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({
      success: true,
      data: { user: result.rows[0] },
    });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error.',
    });
  }
});

// POST /api/auth/logout (protected) – client should discard tokens
router.post('/logout', auth, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully. Discard tokens on client.' });
});

// POST /api/auth/forgot-password – request OTP for password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Valid email is required.' });
    }

    const result = await pool.query(
      `SELECT ${col.id}, ${col.email} FROM ${table} WHERE ${col.email} = $1`,
      [email.toLowerCase().trim()]
    );
    if (result.rows.length === 0) {
      return res.json({
        success: true,
        message: 'If an account exists with this email, an OTP has been sent.',
      });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    await pool.query(
      `UPDATE ${table} SET ${col.otp} = $1, ${col.otpExpiresAt} = $2 WHERE ${col.id} = $3`,
      [otp, expiresAt, result.rows[0].id]
    );

    if (process.env.NODE_ENV === 'development') {
      return res.json({
        success: true,
        message: 'OTP generated. In production, send via email.',
        otp,
        expiresInMinutes: OTP_EXPIRY_MINUTES,
      });
    }
    res.json({
      success: true,
      message: 'If an account exists with this email, an OTP has been sent.',
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// POST /api/auth/verify-otp – verify OTP and return reset token
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
    }

    const result = await pool.query(
      `SELECT ${col.id}, ${col.email}, ${col.otp}, ${col.otpExpiresAt} FROM ${table} WHERE ${col.email} = $1`,
      [email.toLowerCase().trim()]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid or expired OTP.' });
    }

    const user = result.rows[0];
    const storedOtp = user[col.otp];
    const expiresAt = user[col.otpExpiresAt];

    if (!storedOtp || !expiresAt || new Date() > new Date(expiresAt)) {
      return res.status(401).json({ success: false, message: 'Invalid or expired OTP.' });
    }
    if (storedOtp !== String(otp).trim()) {
      return res.status(401).json({ success: false, message: 'Invalid or expired OTP.' });
    }

    const resetToken = jwt.sign(
      { id: user.id, email: user.email, type: 'password_reset' },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '15m' }
    );

    res.json({
      success: true,
      message: 'OTP verified.',
      data: { resetToken, expiresIn: 900 },
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// POST /api/auth/reset-password – set new password using reset token
router.post('/reset-password', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      return res.status(400).json({ success: false, message: 'Reset token and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_REFRESH_SECRET);
    } catch (e) {
      return res.status(401).json({ success: false, message: 'Invalid or expired reset link.' });
    }
    if (decoded.type !== 'password_reset') {
      return res.status(401).json({ success: false, message: 'Invalid reset token.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    await pool.query(
      `UPDATE ${table} SET ${col.passwordHash} = $1, ${col.otp} = NULL, ${col.otpExpiresAt} = NULL, ${col.updatedAt} = CURRENT_TIMESTAMP WHERE ${col.id} = $2`,
      [password_hash, decoded.id]
    );

    res.json({ success: true, message: 'Password reset successfully. You can log in with your new password.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
