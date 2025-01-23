import express from 'express'
import {
  allAttendence,
  allAttendenceByDate,
  checkinUser,
  checkoutUser,
  deleteByIdAndDate,
  updateAttendence,
  userAttendence,
  userAttendenceByDate
} from '../controller/attendenceController'
import { authenticate } from '../middleware/authenticate'
import { isAdmin } from '../middleware/isAdmin'

const attendenceRouter = express.Router()

// These are the user controlled routes
attendenceRouter.post('/checkin', authenticate, checkinUser)
attendenceRouter.post('/checkout', authenticate, checkoutUser)

// These All are Admin controlled Routes
attendenceRouter.get('/record', authenticate, isAdmin, allAttendence)
attendenceRouter.get(
  '/recordbydate',
  authenticate,
  isAdmin,
  allAttendenceByDate
)
attendenceRouter.put(
  '/update/:id',
  // authenticate,
  // isAdmin,
  updateAttendence
)
attendenceRouter.get('/user', authenticate, isAdmin, userAttendence)
attendenceRouter.get('/userbydate', authenticate, isAdmin, userAttendenceByDate)
attendenceRouter.delete('/delete', authenticate, isAdmin, deleteByIdAndDate)

export default attendenceRouter
