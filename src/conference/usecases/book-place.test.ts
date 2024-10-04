import { addDays, addHours } from "date-fns"
import { User } from "../../user/entities/user.entity"
import { InMemoryBookingRepository } from "../adapters/in-memory-booking-repository"
import { Conference } from "../entities/conference.entity"
import { BookConferencePlace } from "./book-place"
import { Booking } from "../entities/booking.entity"
import { InMemoryConferenceRepository } from "../adapters/in-memory-conference-repository"
import { InMemoryMailer } from "../../core/adapters/in-memory-mailer"
import { InMemoryUserRepository } from "../../user/adapters/in-memory-user-repository"

describe('Feature: Booking a conference place', () => {
  function expectBookingToEqual(booking: Booking) {
    expect(booking.props).toEqual({
      userId: "john-doe",
      conferenceId: 'conference1',
    })
  }

  const johnDoe = new User({
    id: 'john-doe',
    emailAddress: 'johndoe@gmail.com',
    password: 'qwerty'
  })

  const bob = new User({
    id: 'bob',
    emailAddress: 'bob@gmail.com',
    password: 'qwerty'
  })

  const conference1 = new Conference({
    id: 'conference1',
    organizerId: 'bob',
    title: "Bob's conference",
    startDate: addDays(new Date(), 5),
    endDate: addDays(addHours(new Date(), 2), 5),
    seats: 20
  })


  let repository: InMemoryBookingRepository
  let conferenceRepository: InMemoryConferenceRepository
  let useCase: BookConferencePlace
  let mailer: InMemoryMailer
  let userRepository: InMemoryUserRepository

  beforeEach(async () => {
    repository = new InMemoryBookingRepository()
    conferenceRepository = new InMemoryConferenceRepository
    conferenceRepository.create(conference1)
    mailer = new InMemoryMailer()
    userRepository = new InMemoryUserRepository()
    await userRepository.create(johnDoe)
    await userRepository.create(bob)
    useCase = new BookConferencePlace(repository, conferenceRepository, mailer, userRepository)
    
  })

  describe('Scenario: Happy path', () => {
    const payload = {
      userId: johnDoe.props.id,
      conferenceId: conference1.props.id
    }

    it('should return the booking', async () => {
      const result = await useCase.execute(payload)

      expect(result).toEqual({
        userId: payload.userId,
        conferenceId: payload.conferenceId
      })
    })

    it('should insert the booking into the database', async () => {
      await useCase.execute(payload)
      const createdBooking = repository.database[0]

      expect(repository.database.length).toBe(1)
      expectBookingToEqual(createdBooking)
    })
  })

  describe('Scenario: conference if fully booked', () => {
    const payload = {
      userId: johnDoe.props.id,
      conferenceId: conference1.props.id
    }

    it('should throw an error', async () => {
      for (let i = 0; i < conference1.props.seats; i++) {
        await repository.create(new Booking({
          userId: `user-${i}`,
          conferenceId: conference1.props.id
        }));
      }

      await expect(() => useCase.execute(payload)).rejects.toThrow("No more booking available for the conference")
    })

    it('should not create a booking', async () => {
      try {
        for (let i = 0; i < conference1.props.seats; i++) {
          await repository.create(new Booking({
            userId: `user-${i}`,
            conferenceId: conference1.props.id
          }));
        }
        await expect(() => useCase.execute(payload)).rejects.toThrow("No more booking available for the conference")
      } catch (error) {
        console.log(error)
      }

      expect(repository.database.length).toBe(conference1.props.seats)
    })
  })

  describe('Scenario: User already booked a conference place', () => {
    const payload = {
      userId: bob.props.id,
      conferenceId: conference1.props.id
    }

    it('should throw an error', async () => {
      await repository.create(new Booking({
        userId: bob.props.id,
        conferenceId: conference1.props.id
      }))

      await expect(() => useCase.execute(payload)).rejects.toThrow("User already booked a place")
    })

    it('should not create a booking', async () => {
      try {
        await repository.create(new Booking({
          userId: bob.props.id,
          conferenceId: conference1.props.id
        }))
        await expect(() => useCase.execute(payload)).rejects.toThrow("User already booked a place")
      } catch (error) {
        console.log(error)
      }

      expect(repository.database.length).toBe(1)
    })
  })

})