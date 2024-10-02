import express from 'express'
import { changeConferenceSeats, organizeConference } from '../controllers/conference.controllers'
import { isAuthenticated } from '../middlewares/authentication.middleware'
import container from '../config/dependency-injection'

const router = express.Router()

router.use(isAuthenticated)
router.post('/conference', organizeConference(container))
router.patch('/conference/seats/:id', changeConferenceSeats(container))

export default router