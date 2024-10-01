import { addDays, addHours } from 'date-fns'
import app from '../infrastructure/express_api/app'
import request from 'supertest'
import { User } from '../user/entities/user.entity'
import { InMemoryUserRepository } from '../user/adapters/in-memeory-user-repository'
import { BasicAuthenticator } from '../user/services/basic-authenticator'

describe("Feature: Organize conference", () => {
  const johnDoe = new User({
    id: 'john-doe',
    emailAddress: 'johndoe@gmail.com',
    password: 'qwerty'
  })

  let repository: InMemoryUserRepository

  beforeEach(async () => {
    repository = new InMemoryUserRepository()
    await repository.create(johnDoe)
  })

  it('should organize a conference', async () => {
    const token = Buffer.from(`${johnDoe.props.emailAddress}:${johnDoe.props.password}`).toString('base64')
    jest.spyOn(BasicAuthenticator.prototype, 'authenticate').mockResolvedValue(johnDoe)


    const result = await request(app)
        .post('/conference')
        .set('Authorization', `Basic ${token}`)
        .send({
          title: "My first conference",
          startDate: addDays(new Date(), 4).toISOString(),
          endDate: addDays(addHours(new Date(), 2), 4).toISOString(),
          seats: 100,
        })

    expect(result.status).toBe(201)
    expect(result.body.data).toEqual({id: expect.any(String)})
  })
})