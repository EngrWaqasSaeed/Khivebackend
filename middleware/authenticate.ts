import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { prismaClient } from '../utils/prismaClient'
import { User } from '@prisma/client'

interface DecodedToken {
  id: number
  name: string
  email: string
  cnic: number
  image: string
  joiningDate: string
  dateOfBirth: string
}

// Extend Request interface to include the `user` property
declare global {
  namespace Express {
    interface Request {
      user?: User
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  const authHeader = req.headers['authorization'];
  // Retrieve the token from the Authorization header
  const token = req.header('Authorization')?.split(' ')?.[1]

  if (!token) {
    res
      .status(401)
      .json({ message: 'Authorization token is required for authmiddleware.' })
    return
  }
  console.log(token)

  try {
    // Verify the token using the secret
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'Waqas'
    ) as DecodedToken

    const isUserExist = await prismaClient.user.findFirst({
      where: {
        id: decoded.id
      }
    })
    if (!isUserExist) {
      res.status(401).json({ message: 'User Not Found' })
      return
    }

    req.user = isUserExist

    // Pass control to the next middleware
    next()
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token.' })
  }
}
