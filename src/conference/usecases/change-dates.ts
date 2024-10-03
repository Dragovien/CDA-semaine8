import { Executable } from "../../core/executable.interface"
import { IDateGenerator } from "../../core/ports/date-generator.interface"
import { IMailer } from "../../core/ports/mailer.interface"
import { User } from "../../user/entities/user.entity"
import { IUserRepository } from "../../user/ports/user-repository.interface"
import { testUsers } from "../../user/tests/user-seeds"
import { Conference } from "../entities/conference.entity"
import { IBookingRepository } from "../ports/booking-repository.interface"
import { IConferenceRepository } from "../ports/conference-repository.interface"
import { testConference } from "../tests/conference-seeds"


type RequestChangeDates = {
  user: User,
  conferenceId: string,
  startDate: Date,
  endDate: Date
}

type ResponseChangeDates = void


export class ChangeDates implements Executable<RequestChangeDates, ResponseChangeDates> {

  constructor(
    private readonly repository: IConferenceRepository,
    private readonly dateGenerator: IDateGenerator,
    private readonly bookingRepository: IBookingRepository,
    private readonly mailer: IMailer,
    private readonly userRepository: IUserRepository
  ) { }

  async execute({ user, conferenceId, startDate, endDate }: RequestChangeDates) {
    const conference = await this.repository.findById(conferenceId)

    if (!conference) throw new Error("Conference not found")

    if (conference.props.organizerId !== user.props.id) throw new Error("You are not allowed to update this conference")

    conference.update({
      startDate,
      endDate
    })

    if (conference.isTooClose(this.dateGenerator.now())) {
      throw new Error("The conference must happen in at least 3 days")
    }

    if (conference.isTooLong()) {
      throw new Error("The conference is too long (> 3 hours)")
    }

    await this.repository.update(conference)

    await this.sendEmailToParticipants(conference)
  }

  async sendEmailToParticipants(conference: Conference): Promise<void> {
    const bookings = await this.bookingRepository.findByConferenceId(conference.props.id)

    const users = await Promise.all(
      bookings
        .map(booking => this.userRepository.findById(booking.props.userId))
        .filter(user => user !== null)
    ) as User[]

    await Promise.all(
      users.map(user => {
        this.mailer.send({
          from: 'TEDx conference',
          to: user.props.emailAddress,
          subject: `The dates of the conference: ${testConference.conference1.props.title} have changed`,
          body: `The dates of the conference: ${testConference.conference1.props.title} have changed`
        })
      })
    )
  }
}