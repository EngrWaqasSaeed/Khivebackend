import { Request, Response, NextFunction } from 'express'

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const role = req.user?.role
  if (!role || role !== 'ADMIN') {
    res.status(401).json({ message: 'Unauthorized Access' })
    return
  }
  next()
}
