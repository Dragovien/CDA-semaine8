import { IsDate, IsDateString, isNotEmpty, IsNotEmpty, IsNumber, IsString } from "class-validator"

export class createConferenceInput {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsNumber()
  @IsNotEmpty()
  seats: number

  @IsDateString()
  @IsNotEmpty()
  startDate: Date

  @IsDateString()
  @IsNotEmpty()
  endDate: Date
}