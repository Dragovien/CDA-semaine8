import { addDays, addHours } from 'date-fns'
import app from '../infrastructure/express_api/app'
import request from 'supertest'

describe("Feature: Organize conference", () => {
  it('should organize a conference', async () => {
    const result = await request(app)
        .post('/conference')
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