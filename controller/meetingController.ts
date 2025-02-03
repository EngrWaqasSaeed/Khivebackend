import { Request, Response, NextFunction } from 'express'
import { Join_Status, PrismaClient } from '@prisma/client'
import { pointsService } from '../services/points.services'

const prisma = new PrismaClient()

export const meetingStatus = async (
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
    console.log('Status is:', statuses)
    today.setHours(0, 0, 0, 0)
    for (const { userId, joining_status } of statuses) {
      if (!validStatuses.includes(joining_status)) {
        throw new Error(`Invalid status: ${joining_status}`)
      }

      const existingRecord = await prisma.meeting.findFirst({
        where: {
          userId,
          date: {
            gte: today // Check if a record exists for today
          }
        }
      })

      if (existingRecord) {
        await prisma.meeting.update({
          where: { id: existingRecord.id },
          data: { joining_status, date: new Date() }
        })
      } else {
        await prisma.meeting.create({
          data: { userId, joining_status, date: new Date() }
        })
      }

      // Update user points based on status
      if (joining_status === 'EARLY') {
        pointsService.changeUserPoints(userId, 100)
      } else if (joining_status === 'ONTIME') {
        pointsService.changeUserPoints(userId, 50)
      } else if (joining_status === 'LATE') {
        pointsService.changeUserPoints(userId, -50)
      } else if (joining_status === 'MISSED') {
        pointsService.changeUserPoints(userId, -500)
      }
    }

    res.status(200).json({ message: 'Meeting statuses processed successfully' })
  } catch (error: any) {
    console.log(error)
    res.status(400).json({ error: error?.message ?? '' })
  }
}

// Get all the Meeting status @admin access only
export const allMeetingRecord = async (req: Request, res: Response) => {
  try {
    const meeting_Status = await prisma.meeting.findMany()
    res.status(200).json(meeting_Status)
  } catch {
    res
      .status(500)
      .json({ message: 'Internal server error in getting meeting status.' })
  }
}

//Get all the break status based on user id @admin access only
export const meetingRecordById = async (req: Request, res: Response) => {
  try {
    const userId = req.params
    if (!userId) {
      res.status(403).json({ message: 'User Id is required!' })
      return
    }
    const meeting_Status = await prisma.meeting.findMany({
      where: {
        userId: userId
      }
    })
    res.status(200).json(meeting_Status)
  } catch {
    res
      .status(500)
      .json({ message: 'Internal server error in meeting_Controller.' })
  }
}

// Update break status by id @admin access only
export const updateMeetingRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { joining_status } = req.body

    const validStatuses = ['EARLY', 'ONTIME', 'LATE', 'MISSED']
    if (!validStatuses.includes(joining_status)) {
      res.status(400).json({ message: 'Invalid Meeting status provided!' })
      return
    }

    const meeting_status = await prisma.meeting.update({
      where: {
        id: Number(id)
      },
      data: {
        joining_status:
          (joining_status as 'EARLY') || 'ONTIME' || 'LATE' || 'MISSED'
      }
    })
    res.status(200).json({
      message: 'Break status updated successfully',
      data: meetingStatus
    })
  } catch {
    res
      .status(500)
      .json({ message: 'Internal server error in meeting update Controller.' })
  }
}

//Delete break status by id @admin access only
export const deleteBreakRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { date } = req.body

    const meeting_status = await prisma.meeting.delete({
      where: {
        id: Number(id)
      }
    })
    res.status(200).json({
      message: 'Break status deleted successfully',
      data: meetingStatus
    })
  } catch {
    res
      .status(500)
      .json({ message: 'Internal server error in meeting delete Controller.' })
  }
}
