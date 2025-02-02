import express from 'express'
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  //   updateProfile,
  updateUser
} from '../controller/userController'

const userRouter = express.Router()

// Routes for user CRUD operations
// userRouter.put('/update/:id', updateProfile) // Update user profile by ID
userRouter.post('/', createUser) // Create a new user
userRouter.get('/allusers', getAllUsers) // Fetch all users
userRouter.get('/:id', getUserById) // Fetch a specific user by ID
userRouter.put('/:id', updateUser) // Update user by ID
userRouter.delete('/:id', deleteUser) // Delete user by ID

export default userRouter
