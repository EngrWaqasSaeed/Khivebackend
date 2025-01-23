import express from 'express'
import {
  protectedUser,
  registerUser,
  signUser
} from '../controller/authController'
import { authenticate } from '../middleware/authenticate'

const loginRouter = express.Router()

loginRouter.post('/register', registerUser)
loginRouter.post('/sign', signUser)
loginRouter.get('/protected', authenticate, protectedUser)

export default loginRouter
