import express from 'express'

import { meetingStatus } from '../controller/meetingController'
import { isAdmin } from '../middleware/isAdmin'
import { authenticate } from '../middleware/authenticate'

const meetingRouter = express.Router()

meetingRouter.post('/', authenticate, isAdmin, meetingStatus) // Create a Meeting status

export default meetingRouter
