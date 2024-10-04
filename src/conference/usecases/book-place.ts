import { DomainException } from "../../core/exceptions/domain-exception"
import { Executable } from "../../core/executable.interface"
import { IMailer } from "../../core/ports/mailer.interface"
import { IUserRepository } from "../../user/ports/user-repository.interface"
import { Booking } from "../entities/booking.entity"
import { Conference } from "../entities/conference.entity"
import { ConferenceNotFoundException } from "../exceptions/conference-not-found"
import { IBookingRepository } from "../ports/booking-repository.interface"
import { IConferenceRepository } from "../ports/conference-repository.interface"


type BookingRequest = {
  userId: string,
  conferenceId: string,
  conferenceSeats: number
}

type BookingResponse = {
  userId: string,
  conferenceId: string,
}

export class BookConferencePlace implements Executable<BookingRequest, BookingResponse> {
  constructor(
    private readonly repository: IBookingRepository,
    private readonly conferenceRepository: IConferenceRepository,
    private readonly mailer: IMailer,
    private readonly userRepository: IUserRepository
  ) {}
  
  async execute({userId, conferenceId}): Promise<BookingResponse> {
    const newBooking = new Booking({
      userId,
      conferenceId
    })

    const conference = await this.conferenceRepository.findById(conferenceId)

    if(!conference) throw new ConferenceNotFoundException()

    const conferenceBookings = await this.repository.findByConferenceId(conferenceId)

    if(conferenceBookings.length === conference?.props.seats) {
      throw new DomainException("No more booking available for the conference")
    }

    const existingUserBooking = conferenceBookings.find(booking => booking.props.userId === userId)

    if(existingUserBooking) {
      throw new DomainException("User already booked a place")
    }

    await this.repository.create(newBooking)
    await this.sendEmail(userId, conference)
    await this.sendEmail(conference.props.organizerId, conference)

    return {userId, conferenceId}
  }

  async sendEmail(userId: string, conference: Conference): Promise<void> {
    const user = await this.userRepository.findById(userId)

    let mailSubject:string
    let mailBody:string

    if(!user) throw new Error('No User found')

    if(user.props.emailAddress === conference.props.organizerId) {
      mailSubject = `A new person has booked a place to conference ${conference.props.title}`
      mailBody = `A new person has booked a place to conference ${conference.props.title}`
    }  else {
      mailSubject = `You have booked a place to conference ${conference.props.title}`
      mailBody = `You have booked a place to conference ${conference.props.title}`
    }

    this.mailer.send({
      from: 'TEDx conference',
      to: user!.props.emailAddress,
      subject: mailSubject,
      body: mailBody
    })
  }
}