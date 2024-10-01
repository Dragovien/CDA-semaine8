import { NextFunction, Request, Response } from "express";
import { CurrentDateGenerator } from "../../../adapters/current-date-generator";
import { InMemoryConferenceRepository } from "../../../adapters/in-memory-conference-repository";
import { RandomIDGenerator } from "../../../adapters/random-id-generator";
import { OrganizeConference } from "../../../usecases/organize-conference";
import { User } from "../../../entities/user.entity";
import { createConferenceInput } from "../dto/conference.dto";
import { ValidatorRequest } from "../utils/validate-request";

const idGenerator = new RandomIDGenerator()
const currentDateGenerator = new CurrentDateGenerator()
const repository = new InMemoryConferenceRepository()
const usecase = new OrganizeConference(
  repository, idGenerator, currentDateGenerator
)

export const organizeConference = async (req: Request, res: Response, next: NextFunction)=> {
    try {
      const body = req.body as createConferenceInput

      const {errors, input} = await ValidatorRequest(createConferenceInput, body)

      if(errors) {       
        return res.status(400).json(errors)
      }

      const result = await usecase.execute({
        user: new User({id: 'john-doe'}),
        title: input.title,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        seats: input.seats
      })

      return res.status(201).json(result)
    } catch (error) {
      next(error);
    }
};