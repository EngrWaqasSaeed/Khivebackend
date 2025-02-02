import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  let {
    name,
    email,
    password,
    con_password,
    cnic,
    image,
    joiningDate,
    dateOfBirth,
    role
  } = req.body

  try {
    // Check if all fields are filled
    if (!name || !email || !password || !con_password) {
      res.status(400).json({ error: 'Please fill all the fields' })
      return
    }

    // Check if passwords match
    if (password !== con_password) {
      res.status(400).json({ error: 'Passwords do not match' })
      return
    }

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    if (existingUser) {
      res.status(400).json({ error: 'User already exists' })
      return
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Convert `cnic` to a number if it's a string
    if (typeof cnic === 'string') {
      cnic = Number(cnic)
      if (isNaN(cnic)) {
        res
          .status(400)
          .json({ error: 'Invalid CNIC format. It should be a number.' })
        return
      }
    }

    //  Save the User in the database
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        cnic: cnic,
        image,
        joiningDate: joiningDate ? new Date(joiningDate) : undefined, // Convert joiningDate to Date if provided
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined, // Convert dateOfBirth to Date if provided
        role
      }
    })

    // Generating the JWt with userId and all other deatils
    const token = jwt.sign(
      {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        cnic: newUser.cnic,
        imageurl: newUser.image,
        joiningDate: newUser.joiningDate,
        dateOFBirth: newUser.dateOfBirth,
        role
      },
      process.env.JWT_SECRET || 'Waqas',
      { expiresIn: '1d' }
    )

    res.json({
      newUser,
      message: 'Register Route is Running'
    })
  } catch (error) {
    console.error('Error during user registration:', error)
    res.status(500).json({
      error: 'An internal server error occurred in registration of user'
    })
  }
}

export const signUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body

    // Check if both fields are filled
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' })
      return
    }

    // Find the user in the database
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      res.status(404).json({ error: 'User not found.' })
      return
    }

    // Validate the password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid password.' })
      return
    }

    // Generate a JWT Token
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        cnic: user.cnic,
        imageurl: user.image,
        joiningDate: user.joiningDate,
        dateOFBirth: user.dateOfBirth
      },
      process.env.JWT_SECRET || 'Waqas',
      { expiresIn: '1h' }
    )

    // Respond with the token and user details
    res.status(200).json({
      message: 'Sign-in successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        cnic: user.cnic,
        imageurl: user.image
      }
    })
  } catch (error) {
    console.error('Error during sign-in:', error)
    res.status(500).json({ error: 'An internal server error occurred.' })
  }
}
export const updateUserDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user?.id // Assuming `req.user` is populated by a middleware like `authMiddleware`
  const { name, email, cnic, password, dob } = req.body

  try {
    // Check if userId is provided (via token)
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized access. Please log in.' })
      return
    }

    // Find the user in the database
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      res.status(404).json({ error: 'User not found.' })
      return
    }

    // Prepare updated data
    const updatedData: any = { name, email, cnic, dateOfBirth: dob }

    // Hash the password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)
      updatedData.password = hashedPassword
    }

    // Update the user in the database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updatedData
    })

    res.status(200).json({
      message: 'Profile updated successfully.',
      updatedUser
    })
  } catch (error) {
    console.error('Error updating user details:', error)
    res.status(500).json({
      error: 'An internal server error occurred while updating user details.'
    })
  }
}

export const protectedUser = (req: Request, res: Response) => {
  res.json({ message: 'This is a protected route.', user: req.user })
}
