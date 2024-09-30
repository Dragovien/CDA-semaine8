import { Conference } from "../entities/conference.entity";
import { User } from "../entities/user.entity";
import { IConferenceRepository } from "../ports/conference-repository.interface";
import { IDateGenerator } from "../ports/date-generator.interface";
import { IIDGenerator } from "../ports/id-generator.interface";

export class OrganizeConference {
  constructor(
    private readonly repository: IConferenceRepository,
    private readonly idGenerator: IIDGenerator, // fixed IDGenerator => 'id-1' , RandomIdGenerator
    private readonly dateGenerator: IDateGenerator
  ){
  }

  async execute(data: {user: User, title: string, startDate: Date, endDate: Date, seats: number}) {
    const id = this.idGenerator.generate()
    const newConference =  new Conference({
      id,
      organizerId: data.user.props.id,
      title: data.title,
      startDate: data.startDate,
      endDate: data.endDate,
      seats: data.seats
    })

    if(newConference.isTooClose(this.dateGenerator.now())) {
      throw new Error("The conference must happen at least 3 days after its creation")
    }

    if(newConference.hasTooManySeats()) {
      throw new Error("The conference must not have more than 1000 seats")
    }

    if(newConference.doesNotHaveEnoughSeats()) {
      throw new Error("The conference must have at least 20 seats")
    }

    if(newConference.isTooLong()) {
      throw new Error("The conference must be less than 3h")
    }


    await this.repository.create(newConference)

    return {id}
  }
}