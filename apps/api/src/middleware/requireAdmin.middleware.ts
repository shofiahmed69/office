import { Request, Response, NextFunction } from 'express'

const ADMIN_ROLES = ['Admin', 'Administrator']

/**
 * Require the authenticated user to have an admin role.
 * Must be used after authenticateToken.
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const user = req.user
  if (!user) {
    res.status(401).json({ success: false, error: 'Authentication required' })
    return
  }
  const role = (user.role || '').trim()
  const isAdmin = ADMIN_ROLES.some((r) => r === role)
  if (!isAdmin) {
    res.status(403).json({ success: false, error: 'Admin access required' })
    return
  }
  next()
}
