import { User } from "../entities/user.entity";

export const testUser = {
  johnDoe:  new User({
    id: 'john-doe',
    emailAddress: 'johndoe@gmail.com',
    password: 'qwerty'
  }),
  bob: new User({
    id: 'bob',
    emailAddress: 'bob@gmail.com',
    password: 'qwerty'
  })
}