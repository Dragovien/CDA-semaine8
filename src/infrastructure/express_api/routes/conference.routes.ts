import express from 'express'
import { bookConference, changeConferenceDates, changeConferenceSeats, organizeConference } from '../controllers/conference.controllers'
import { isAuthenticated } from '../middlewares/authentication.middleware'
import container from '../config/dependency-injection'

const router = express.Router()

router.use(isAuthenticated)
router.post('/conference', organizeConference(container))
router.post('/conference/booking/:id', bookConference(container))
router.patch('/conference/seats/:id', changeConferenceSeats(container))
router.patch('/conference/dates/:id', changeConferenceDates(container))

export default router