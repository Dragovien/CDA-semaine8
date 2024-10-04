
import { ChangeSeats } from "./change-seats"
import { InMemoryConferenceRepository } from "../adapters/in-memory-conference-repository"
import { testConferences } from "../tests/conference-seeds"
import { testUsers } from "../../user/tests/user-seeds"
import { InMemoryBookingRepository } from "../adapters/in-memory-booking-repository"
import { Booking } from "../entities/booking.entity"

describe("Feature: changing the number of seats", () => {

  async function expectSeatsUnchanged() {
    const fetchedConference = await repository.findById(testConferences.conference1.props.id)
    expect(fetchedConference?.props.seats).toEqual(50)
  }

  let repository: InMemoryConferenceRepository
  let useCase: ChangeSeats
  let bookingRepository: InMemoryBookingRepository

  beforeEach(async () => {
    repository = new InMemoryConferenceRepository
    await repository.create(testConferences.conference1)
    useCase = new ChangeSeats(repository)
    bookingRepository = new InMemoryBookingRepository
  })

  describe('Scenario: Happy Path', () => {
    it('should change the number of seats', async () => {
      await useCase.execute({
        user: testUsers.johnDoe,
        conferenceId: testConferences.conference1.props.id,
        seats: 100
      })

      const fetchedConference = await repository.findById(testConferences.conference1.props.id)

      expect(fetchedConference!.props.seats).toEqual(100)
    })
  })

  describe('Scenario: Conference doesn\'t exist', () => {
    it('should fail', async () => {

      await expect(useCase.execute({
        user: testUsers.johnDoe,
        conferenceId: 'non-existing-id',
        seats: 100
      })).rejects.toThrow('Conference not found')

      await expectSeatsUnchanged()
    })
  })

  describe('Scenario: Update the conference of someone else', () => {
    it('should fail', async () => {

      await expect(useCase.execute({
        user: testUsers.bob,
        conferenceId: testConferences.conference1.props.id,
        seats: 100
      })).rejects.toThrow('You are not allowed to update this conference')

      await expectSeatsUnchanged()
    })
  })

  describe('Scenario: Number of seats  <= 1000', () => {
    it('should fail', async () => {

      await expect(useCase.execute({
        user: testUsers.johnDoe,
        conferenceId: testConferences.conference1.props.id,
        seats: 1001
      })).rejects.toThrow('The conference must have a maximum of 1000 seats and minimum of 20 seats')

      await expectSeatsUnchanged()
    })
  })

  describe('Scenario: Number of seats >= 20', () => {
    it('should fail', async () => {

      await expect(useCase.execute({
        user: testUsers.johnDoe,
        conferenceId: testConferences.conference1.props.id,
        seats: 19
      })).rejects.toThrow('The conference must have a maximum of 1000 seats and minimum of 20 seats')

      await expectSeatsUnchanged()
    })
  })

  describe('Scenario: Number of seats <= number of booking', () => {
    it('should fail', async () => {

      for (let i = 0; i < testConferences.conference2.props.seats; i++) {
        await bookingRepository.create(new Booking({
          userId: `user-${i}`,
          conferenceId: testConferences.conference2.props.id
        }));
  
      }

      await expect(useCase.execute({
        user: testUsers.johnDoe,
        conferenceId: testConferences.conference1.props.id,
        seats: 20
      })).rejects.toThrow('The conference must not have less seats than already booked')

    })
  })
})