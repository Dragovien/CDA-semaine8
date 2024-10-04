import { Application } from "express"
import { TestApp } from "./utils/test-app"
import { e2eUsers } from "./seeds/user-seeds"
import request from 'supertest'
import { e2eConference } from "./seeds/conference-seed"

describe("Feature: Book a conference place", () => {
  let testApp: TestApp
  let app: Application

  beforeEach(async () => {
    testApp = new TestApp()
    await testApp.setup()
    await testApp.loadAllFixtures([e2eUsers.johnDoe, e2eUsers.bob, e2eConference.conference2])
    app = testApp.expressApp
  })

  afterAll(async () => {
    await testApp.teardown()
  })

  it('should book a conference place', async () => {
    const id = e2eConference.conference2.entity.props.id

    const result = await request(app)
      .post(`/conference/booking/${id}`)
      .set('Authorization', e2eUsers.johnDoe.createAuthorizationToken())
      .send({
        userId: e2eUsers.johnDoe.entity.props.id
      })

    expect(result.status).toBe(201)
    expect(result.body.data).toEqual({ userId: e2eUsers.johnDoe.entity.props.id, conferenceId: id })
  })
})