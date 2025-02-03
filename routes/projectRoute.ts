import express from 'express'

import { isAdmin } from '../middleware/isAdmin'
import { authenticate } from '../middleware/authenticate'
import {
  getProjectStatus,
  projectStatus
} from '../controller/projectController'

const projectRouter = express.Router()

projectRouter.post('/', authenticate, isAdmin, projectStatus) // Create a Meeting status
projectRouter.get('/', authenticate, isAdmin, getProjectStatus) // Create a Meeting status

export default projectRouter
