type userProps = {
  id: string,
  emailAddress: string,
  password: string
}

export class User {
  constructor(public props: userProps) {}
}