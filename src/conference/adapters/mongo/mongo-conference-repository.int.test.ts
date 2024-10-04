import { Model } from "mongoose"
import { TestApp } from "../../../tests/utils/test-app"
import { MongoConference } from "./mongo-conference"
import { MongoConferenceRepository } from "./mongo-conference-repository"
import { testConferences } from "../../tests/conference-seeds"
import { testUsers } from "../../../user/tests/user-seeds"
import { addDays, addHours } from "date-fns"
import { ConferenceNotFoundException } from "../../exceptions/conference-not-found"
import { Conference } from "../../entities/conference.entity"

describe('MongoUserRepository', () => {
  let app: TestApp
  let model: Model<MongoConference.ConferenceDocument>
  let repository: MongoConferenceRepository

  beforeEach(async () => {
    app = new TestApp()
    await app.setup()

    model = MongoConference.ConferenceModel
    await model.deleteMany({})
    repository = new MongoConferenceRepository(model)

    const record = new model({
      _id: testConferences.conference1.props.id,
      organizerId: testConferences.conference1.props.organizerId,
      title: testConferences.conference1.props.title,
      startDate: testConferences.conference1.props.startDate,
      endDate: testConferences.conference1.props.endDate,
      seats: testConferences.conference1.props.seats
    })

    await record.save()
    repository = new MongoConferenceRepository(model)
  })


  afterEach(async () => {
    await app.teardown()
  })

  describe('Scenario: Create a conference', () => {
    it('should create a conference', async () => {
      await repository.create(testConferences.conference2)
      const fetchedConference = await model.findOne({ _id: testConferences.conference2.props.id })

      expect(fetchedConference?.toObject()).toEqual({
        _id: testConferences.conference2.props.id,
        organizerId: testUsers.johnDoe.props.id,
        title: testConferences.conference2.props.title,
        seats: testConferences.conference2.props.seats,
        startDate: testConferences.conference2.props.startDate,
        endDate: testConferences.conference2.props.endDate,
        __v: 0
      })
    })
  })

  describe('Scenario: Find by id', () => {
    it('should find the conference corresponding to the id', async () => {
      const conference = await repository.findById(testConferences.conference1.props.id)
      expect(conference?.props).toEqual(testConferences.conference1.props)
    })

    it('should return null if no conference found', async () => {
      const conference = await repository.findById('non-existing-id')
      expect(conference).toBeNull()
    })
  })

  describe('Scenario: Update a conference', () => {
    const startDate = addDays(new Date(), 8)
    const endDate = addDays(addHours(new Date(), 2), 8)
    const seats = 30

    it('should update the conference', async () => {

      const fetchedConference = await repository.findById(testConferences.conference1.props.id)

      if (!fetchedConference) throw new ConferenceNotFoundException()

      fetchedConference.update({
        startDate: startDate,
        endDate: endDate,
        seats: seats
      })

      await repository.update(fetchedConference!);

      const updatedConference = await repository.findById(testConferences.conference1.props.id)

      expect(updatedConference!.props.startDate).toEqual(startDate)

      expect(updatedConference!.props.endDate).toEqual(endDate)

      expect(updatedConference!.props.seats).toEqual(seats)
    })

    it('should throw an error when trying to update a non-existing conference', async () => {

      const nonExistentConference = new Conference({

        id: 'non-existing-id',
        organizerId: 'dummy-organizer-id',
        title: 'Non-existent Conference',
        startDate,
        endDate,
        seats
      });


      await expect(repository.update(nonExistentConference)).rejects.toThrow(ConferenceNotFoundException);
    });
  })
})