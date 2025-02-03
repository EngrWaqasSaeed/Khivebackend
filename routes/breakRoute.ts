import express from 'express'
import {
  allBreakRecord,
  breakRecordById,
  breakStatus,
  deleteBreakRecord,
  updateBreakRecord
} from '../controller/breakController'
import { authenticate } from '../middleware/authenticate'
import { isAdmin } from '../middleware/isAdmin'

const breakRouter = express.Router()

breakRouter.post('/', authenticate, isAdmin, breakStatus)
breakRouter.get('/', authenticate, isAdmin, allBreakRecord)
breakRouter.get('/:id', authenticate, isAdmin, breakRecordById)
breakRouter.put('/:id', authenticate, isAdmin, updateBreakRecord)
breakRouter.delete('/:id', authenticate, isAdmin, deleteBreakRecord)

export default breakRouter
