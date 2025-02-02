import express from 'express'

import { meetingStatus } from '../controller/meetingController'

const meetingRouter = express.Router()

meetingRouter.post('/', meetingStatus) // Create a Meeting status

export default meetingRouter
