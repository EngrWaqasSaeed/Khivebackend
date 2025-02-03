import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { z, ZodError } from 'zod'
import { pointsService } from '../services/points.services'

const prisma = new PrismaClient()

// update specific record based on specific user; @Controlled By Admin Only
export const updateAttendence = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params
    const body = req.body

    if (!id) {
      res.status(400).json({ message: 'User id is missing' })
    }

    const attendanceSchema = z.object({
      checkin: z.date().optional(),
      checkout: z.date().optional(),
      date: z.date().optional(),
      workStatus: z.enum(['ONSITE', 'WORKFORMHOME', 'HYBRID']).optional()
    })

    const data = attendanceSchema.parse(body)

    const updatedAttendence = await prisma.attendence.update({
      where: {
        id: Number(id)
      },
      data
    })

    res.status(200).json({
      message: 'Attendence Record Updated Successfully',
      data: updatedAttendence
    })
  } catch (error: any) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: error.errors })
      return
    }

    console.error('Error during updating Attendence Record:', error)
    res.status(500).json({ message: 'Something went wrong!' })
  }
}

// Check-in controller
export const checkinUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user
    const { workStatus, todayTask } = req.body

    const validStatuses = ['ONSITE', 'WORKFORMHOME', 'HYBRID']
    if (!validStatuses.includes(workStatus)) {
      res.status(400).json({ message: 'Invalid work status provided!' })
      return
    }

    if (!user?.id) {
      res.status(403).json({ message: 'User not authenticated!' })
      return
    }

    const currentDate = new Date()

    // Create a new check-in record in the database
    const checkIn = await prisma.attendence.create({
      data: {
        userId: user.id,
        checkin: currentDate,
        date: currentDate,
        checkout: null,
        workStatus: workStatus as 'ONSITE' | 'WORKFORMHOME' | 'HYBRID',
        todayTask: todayTask || null // Save today's task, if provided
      }
    })

    // check if time is more than 10 am
    if (currentDate.getHours() < 10) {
      pointsService.changeUserPoints(user.id, 200)
    }

    if (currentDate.getHours() == 10) {
      pointsService.changeUserPoints(user.id, 100)
    }

    // after 10 am
    if (currentDate.getHours() > 10) {
      // per min decrease 50 points
      const diff = currentDate.getHours() - 10
      const diffInMin = diff * 60 + currentDate.getMinutes()
      const points = 50 * diffInMin

      pointsService.changeUserPoints(user.id, -points)
    }

    // Respond with the created check-in record
    res.status(201).json({
      message: 'Check-in successful.',
      data: checkIn
    })
  } catch (error) {
    console.error('Error during check-in:', error)
    res.status(500).json({ message: 'Internal server error.' })
  }
}

// Check-out controller
export const checkoutUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user
    const { dayReport } = req.body

    if (!user?.id) {
      res.status(401).json({ message: 'User not authenticated!' })
      return
    }

    // Find the latest check-in record for the user where checkout is null
    const lastCheckIn = await prisma.attendence.findFirst({
      where: {
        userId: user.id,
        checkout: null
      }
    })

    if (!lastCheckIn) {
      res.status(400).json({ message: 'No active check-in found!' })
      return
    }

    // Update the check-in record with the checkout time and day report
    const updatedCheckIn = await prisma.attendence.update({
      where: {
        id: lastCheckIn.id
      },
      data: {
        checkout: new Date(),
        dayReport: dayReport || null // Save the day report, if provided
      }
    })

    // Calculate points based difference from the 6pm
    const currentDate = new Date()
    const diff = currentDate.getHours() - 18
    const points = 200 * diff

    pointsService.changeUserPoints(user.id, points)

    // Respond with the updated check-in record
    res.status(200).json({
      message: 'Check-out successful.',
      data: updatedCheckIn
    })
  } catch (error) {
    console.error('Error during check-out:', error)
    res.status(500).json({ message: 'Internal server error.' })
  }
}

//Get the Current Checkin User
export const getUserDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user

    if (!user?.id) {
      res.status(401).json({ message: 'User not authenticated!' })
      return
    }

    // Fetch user details along with their check-in/check-out history
    const userDetails = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        name: true,
        email: true,
        role: true,
        contact_number: true,
        image: true
      }
    })

    if (!userDetails) {
      res.status(404).json({ message: 'User not found!' })
      return
    }

    // Respond with user details
    res.status(200).json({
      message: 'User details retrieved successfully.',
      data: userDetails
    })
    //If error Occurs
  } catch (error) {
    console.error('Error retrieving user details:', error)
    res.status(500).json({ message: 'Internal server error.' })
  }
}

//Show all Attendence record; @Controlled By Admin Only
export const allAttendence = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const allAttendence = await prisma.attendence.findMany({
      include: {
        user: true
      }
    })

    res.status(200).json({
      message: 'All Attendence Record Fetched Successfully',
      data: allAttendence
    })
  } catch (error) {
    console.error('Error during fetching all Attendence Record:', error)
    res.status(500).json({ message: 'Internal server error.' })
  }
}

// show all attendence record based on specific date; @Controlled By Admin Only
export const allAttendenceByDate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { date } = req.body || {}

    if (!date) {
      res.status(401).json({ message: 'Date is Required!' })
      return
    }

    const startDate = new Date(date)
    const endDate = new Date(date)
    endDate.setHours(23, 59, 59, 999)

    const allAttendence = await prisma.attendence.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        user: true
      }
    })

    res.status(200).json({
      message: 'All Attendence Record Fetched Successfully by Date',
      data: allAttendence
    })
  } catch (error) {
    console.error('Error during fetching all Attendence Record:', error)
    res.status(500).json({ message: 'Internal server error.' })
  }
}

//get all attendence record based on specific user ; @Controlled By Admin Only
export const userAttendence = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.body || {}

    if (!id) {
      res.status(401).json({ message: 'User Id is Required!' })
      return
    }

    const userAttendence = await prisma.attendence.findMany({
      where: {
        userId: Number(id)
      },
      include: {
        user: true
      }
    })

    res.status(200).json({
      message: 'User Attendence Record Fetched Successfully',
      data: userAttendence
    })
  } catch (error) {
    console.error('Error during fetching user Attendence Record:', error)
    res.status(500).json({ message: 'Internal server error.' })
  }
}

// get all attendence status of a specific user on specific date; @Controlled By Admin Only
export const userAttendenceByDate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id, date } = req.body || {}

    if (!id || !date) {
      res.status(401).json({ message: 'User Id and date are required!' })
      return
    }

    const startDate = new Date(date)
    const endDate = new Date(date)
    endDate.setHours(23, 59, 59, 999)

    const userAttendence = await prisma.attendence.findMany({
      where: {
        userId: Number(id),
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        user: true
      }
    })

    res.status(200).json({
      message: 'User Attendence Record Fetched Successfully by Date',
      data: userAttendence
    })
  } catch (error) {
    console.error('Error during fetching user Attendence Record:', error)
    res
      .status(500)
      .json({ message: 'Internal server error in Fetching by date.' })
  }
}

export const deleteByIdAndDate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id, date } = req.body || {}

    if (!id || !date) {
      res.status(401).json({
        message:
          'USER ID AND DATE IS REQUIRED TO DELETE THE SPECIFIC USER ATTENDNENCE ON A SPECIFIC DATE'
      })
      return
    }

    const startDate = new Date(date)
    const endDate = new Date(date)
    endDate.setHours(23, 59, 59, 999)

    const deleteAttendence = await prisma.attendence.deleteMany({
      where: {
        userId: Number(id),
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    })
    res.status(200).json({
      message: 'User Deleted Successfuly on a specific Date or time',
      deleteAttendence
    })
  } catch (error) {
    console.error('Error During deleting the user Attendence Record', error)
    res.status(500).json({ message: 'Internal server error in delete route.' })
  }
}

//show all attendence record based on specific user;@Controlled By Admin Only

//show all attendence record based on specific user and date;@Controlled By Admin Only

//show all attendence record based on specific date;@Controlled By Admin Only
