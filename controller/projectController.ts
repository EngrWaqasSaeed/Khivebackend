import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { pointsService } from '../services/points.services'
const prisma = new PrismaClient()

export const projectStatus = async (
  req: Request,
  res: Response
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

    for (const { userId, project_status } of statuses) {
      if (!validStatuses.includes(project_status)) {
        throw new Error(`Invalid status: ${project_status}`)
      }

      const existingRecord = await prisma.project_Delivery.findFirst({
        where: {
          userId,
          date: {
            gte: today // Check if a record exists for today
          }
        }
      })

      if (existingRecord) {
        await prisma.project_Delivery.update({
          where: { id: existingRecord.id },
          data: { project_status, date: new Date() }
        })
      } else {
        await prisma.project_Delivery.create({
          data: { userId, project_status, date: new Date() }
        })
      }

      // Update user points based on status
      if (project_status === 'EARLY') {
        pointsService.changeUserPoints(userId, 100)
      } else if (project_status === 'ONTIME') {
        pointsService.changeUserPoints(userId, 50)
      } else if (project_status === 'LATE') {
        pointsService.changeUserPoints(userId, -50)
      } else if (project_status === 'MISSED') {
        pointsService.changeUserPoints(userId, -500)
      }
    }

    res.status(200).json({ message: 'Project statuses processed successfully' })
  } catch (error: any) {
    console.log(error)
    res.status(400).json({ error: error?.message ?? '' })
  }
}
// Get Project Status
export const getProjectStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user

    if (!user?.id) {
      res.status(403).json({ message: 'User not authenticated!' })
      return
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const projectStatus = await prisma.project_Delivery.findMany({
      where: {
        userId: user.id,
        date: {
          gte: today // Get records for today or later
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    if (!projectStatus || projectStatus.length === 0) {
      res.status(404).json({ message: 'No project status found for today!' })
      return
    }

    res.status(200).json({ projectStatus })
  } catch (error: any) {
    console.log(error)
    res.status(500).json({ error: error?.message ?? 'Internal Server Error' })
  }
}

//Get all the project status based on user id @admin access only
export const ProjectById = async (req: Request, res: Response) => {
  try {
    const userId = req.params
    if (!userId) {
      res.status(403).json({ message: 'User Id is required!' })
      return
    }
    const projectStatus = await prisma.project_Delivery.findMany({
      where: {
        userId: userId
      }
    })
    res.status(200).json(projectStatus)
  } catch {
    res
      .status(500)
      .json({ message: 'Internal server error in Updating project details.' })
  }
}

// Update break status by id @admin access only
export const updateProductRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { project_status } = req.body

    const validStatuses = ['EARLY', 'ONTIME', 'LATE']
    if (!validStatuses.includes(project_status)) {
      res.status(400).json({ message: 'Invalid project status provided!' })
      return
    }

    const projectStatus = await prisma.project_Delivery.update({
      where: {
        id: Number(id)
      },
      data: {
        project_status: (project_status as 'EARLY') || 'ONTIME' || 'LATE'
      }
    })
    res.status(200).json({
      message: 'Break status updated successfully',
      data: projectStatus
    })
  } catch {
    res
      .status(500)
      .json({ message: 'Internal server error in break update Controller.' })
  }
}

//Delete project status by id @admin access only
export const deleteProjectRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const project_status = await prisma.project_Delivery.delete({
      where: {
        id: Number(id)
      }
    })
    res.status(200).json({
      message: 'project record  deleted successfully',
      data: project_status
    })
  } catch {
    res
      .status(500)
      .json({ message: 'Internal server error in project delete Controller.' })
  }
}
