import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'
import { pointsService } from '../services/points.services'

const prisma = new PrismaClient()

export const breakStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user
    const { statuses } = req.body // Expecting an array of user statuses

    if (!user?.id) {
      res.status(403).json({ message: 'User not authenticated!' })
      return
    }

    if (!Array.isArray(statuses) || statuses.length === 0) {
      res.status(400).json({ message: 'Invalid data format!' })
      return
    }

    const validStatuses = ['EARLY', 'ONTIME', 'LATE', 'MISSED']
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    console.log('Break status is:', statuses)

    for (const { userId, break_status } of statuses) {
      if (!break_status) {
        throw new Error(`Invalid status: ${break_status} for userId: ${userId}`)
      }
      if (!validStatuses.includes(break_status)) {
        throw new Error(`Invalid status: ${break_status}`)
      }

      const existingRecord = await prisma.break.findFirst({
        where: {
          userId,
          date: {
            gte: today // Check if a record exists for today
          }
        }
      })

      if (existingRecord) {
        await prisma.break.update({
          where: { id: existingRecord.id },
          data: { break_status, date: new Date() }
        })
      } else {
        await prisma.break.create({
          data: { userId, break_status, date: new Date() }
        })
      }

      // Update user points based on status
      if (break_status === 'EARLY') {
        pointsService.changeUserPoints(userId, 100)
      } else if (break_status === 'ONTIME') {
        pointsService.changeUserPoints(userId, 50)
      } else if (break_status === 'LATE') {
        pointsService.changeUserPoints(userId, -50)
      } else if (break_status === 'MISSED') {
        pointsService.changeUserPoints(userId, -500)
      }
    }

    res.status(200).json({ message: 'Break statuses processed successfully' })
  } catch (error: any) {
    console.log(error)
    res.status(400).json({ error: error?.message ?? '' })
  }
}

// Get all the break status @admin access only
export const allBreakRecord = async (req: Request, res: Response) => {
  try {
    const breakStatus = await prisma.break.findMany()
    res.status(200).json(breakStatus)
  } catch {
    res
      .status(500)
      .json({ message: 'Internal server error in breakController.' })
  }
}

//Get all the break status based on user id @admin access only
export const breakRecordById = async (req: Request, res: Response) => {
  try {
    const userId = req.params
    if (!userId) {
      res.status(403).json({ message: 'User Id is required!' })
      return
    }
    const breakStatus = await prisma.break.findMany({
      where: {
        userId: userId
      }
    })
    res.status(200).json(breakStatus)
  } catch {
    res
      .status(500)
      .json({ message: 'Internal server error in breakController.' })
  }
}

// Update break status by id @admin access only
export const updateBreakRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { breakStatus } = req.body

    const validStatuses = ['EARLY', 'ONTIME', 'LATE']
    if (!validStatuses.includes(breakStatus)) {
      res.status(400).json({ message: 'Invalid work status provided!' })
      return
    }

    const break_status = await prisma.break.update({
      where: {
        id: Number(id)
      },
      data: {
        break_status: (breakStatus as 'EARLY') || 'ONTIME' || 'LATE'
      }
    })
    res.status(200).json({
      message: 'Break status updated successfully',
      data: break_status
    })
  } catch {
    res
      .status(500)
      .json({ message: 'Internal server error in break update Controller.' })
  }
}

//Delete break status by id @admin access only
export const deleteBreakRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { date } = req.body

    const break_status = await prisma.break.delete({
      where: {
        id: Number(id)
      }
    })
    res.status(200).json({
      message: 'Break status deleted successfully',
      data: break_status
    })
  } catch {
    res
      .status(500)
      .json({ message: 'Internal server error in break delete Controller.' })
  }
}
