import express from 'express'
import { organizeConference } from '../controllers/conference.controllers'
import { isAuthenticated } from '../middlewares/authentication.middleware'

const router = express.Router()

router.use(isAuthenticated)
router.post('/conference', organizeConference)

export default router