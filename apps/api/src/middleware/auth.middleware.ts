import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { JWTPayload } from '../types'
import { isBlacklisted } from '../utils/tokenBlacklist'

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET

export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    res.status(401).json({ success: false, error: 'Access token required' })
    return
  }

  const blacklisted = await isBlacklisted(token)
  if (blacklisted) {
    res.status(403).json({ success: false, error: 'Token has been revoked' })
    return
  }

  if (!JWT_SECRET) {
    res.status(503).json({ success: false, error: 'Server configuration error' })
    return
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    req.user = decoded
    next()
  } catch {
    res.status(403).json({ success: false, error: 'Invalid or expired token' })
    return
  }
}

export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token && JWT_SECRET) {
    try {
      const blacklisted = await isBlacklisted(token)
      if (!blacklisted) {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
        req.user = decoded
      }
    } catch {
      // Continue without user if token is invalid
    }
  }
  next()
}
