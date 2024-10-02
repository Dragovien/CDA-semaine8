import { addDays, addHours } from "date-fns";
import { testUser } from "../../user/tests/user-seeds";
import { ConferenceFixture } from "../../tests/fixtures/conference-fixture";
import { Conference } from "../../conference/entities/conference.entity";

export const testConference = {
  conference1: new ConferenceFixture(
    new Conference({
      id: "id-1",
      organizerId: testUser.johnDoe.props.id,
      title: "My first conference",
      seats: 50,
      startDate: addDays(new Date(), 4),
      endDate: addDays(addHours(new Date(), 2), 4),
  
    })
  )
}