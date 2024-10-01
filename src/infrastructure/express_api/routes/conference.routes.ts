import express from 'express'
import { organizeConference } from '../controllers/conference.controllers'

const router = express.Router()

router.post('/conference', organizeConference)

export default router