import request from 'supertest'
import container from '../infrastructure/express_api/config/dependency-injection'
import { IConferenceRepository } from '../conference/ports/conference-repository.interface'
import { TestApp } from './utils/test-app'
import { Application } from 'express'
import { e2eUsers } from './seeds/user-seeds'
import { testConference } from './seeds/conference-seed'
import { addDays, addHours } from 'date-fns'

describe("Feature: Change conference dates", () => {

  let testApp: TestApp
  let app: Application

  beforeEach(async () => {
    testApp = new TestApp()
    await testApp.setup()
    await testApp.loadAllFixtures([e2eUsers.johnDoe,e2eUsers.bob, e2eUsers.alice, testConference.conference1])
    app = testApp.expressApp
  })

  afterAll(async () => {
    await testApp.teardown()
  })

  describe("Feature: Happy Path", () => {

    it('should change conference dates', async () => {
      const startDate = addDays(new Date(), 8)
      const endDate = addDays(addHours(new Date(), 2), 8)
      const id = 'id-1'

      const result = await request(app)
        .patch(`/conference/dates/${id}`)
        .set('Authorization', e2eUsers.johnDoe.createAuthorizationToken())
        .send({ startDate: startDate.toISOString(), endDate: endDate.toISOString() })
      
      expect(result.status).toBe(200)

      const conferenceRepository = container.resolve('conferenceRepository') as IConferenceRepository
      const fetchedConference = await conferenceRepository.findById(id)

      expect(fetchedConference).toBeDefined()
      expect(fetchedConference?.props.startDate).toEqual(startDate)
      expect(fetchedConference?.props.endDate).toEqual(endDate)
    })
  })

  describe("User is not authorized", () => {

    it('should return 403 Unauthorized', async () => {
      const startDate = addDays(new Date(), 8)
      const endDate = addDays(addHours(new Date(), 2), 8)
      const id = 'id-1'

      const result = await request(app)
        .patch(`/conference/dates/${id}`)
        .send({ startDate, endDate })

      expect(result.status).toBe(403)
    })
  })

})