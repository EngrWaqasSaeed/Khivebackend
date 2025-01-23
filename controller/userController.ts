import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { z, ZodError } from 'zod'

const prisma = new PrismaClient()

// Update a user by ID
export const updateProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params
    const body = req.body

    if (!id) {
      res.status(400).json({ message: 'User Id is missing' })
    }

    const updateUserSchema = z.object({
      cnic: z.number().optional(),
      joiningDate: z.date().optional(),
      dateOfBirth: z.date().optional(),
      image: z.string().optional()
    })

    const data = updateUserSchema.parse(body)

    const updatedUser = await prisma.user.update({
      where: {
        id: Number(id)
      },
      data
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

// Create a new user
export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, email, password } = req.body

  try {
    if (!name || !email || !password) {
      res.status(400).json({ error: 'All fields are required.' })
      return
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })

    if (existingUser) {
      res.status(400).json({ error: 'User already exists.' })
      return
    }

    const newUser = await prisma.user.create({
      data: { name, email, password }
    })

    res.status(201).json(newUser)
  } catch (error) {
    console.error('Error creating user:', error)
    res
      .status(500)
      .json({ error: 'An error occurred while creating the user.' })
  }
}

// Get all users
export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await prisma.user.findMany()
    res.status(200).json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ error: 'An error occurred while fetching users.' })
  }
}

// Get a user by ID
export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) }
    })

    if (!user) {
      res.status(404).json({ error: 'User not found.' })
      return
    }

    res.status(200).json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    res
      .status(500)
      .json({ error: 'An error occurred while fetching the user.' })
  }
}

// Update a user by ID
export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params
  const { name, email, password } = req.body

  try {
    const user = await prisma.user.findUnique({ where: { id: Number(id) } })

    if (!user) {
      res.status(404).json({ error: 'User not found.' })
      return
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: { name, email, password }
    })

    res.status(200).json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    res
      .status(500)
      .json({ error: 'An error occurred while updating the user.' })
  }
}

// Delete a user by ID
export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params

  try {
    const user = await prisma.user.findUnique({ where: { id: Number(id) } })

    if (!user) {
      res.status(404).json({ error: 'User not found.' })
      return
    }

    await prisma.user.delete({ where: { id: Number(id) } })
    res.status(200).json({ message: 'User deleted successfully.' })
  } catch (error) {
    console.error('Error deleting user:', error)
    res
      .status(500)
      .json({ error: 'An error occurred while deleting the user.' })
  }
}
