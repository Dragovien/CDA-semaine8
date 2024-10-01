import { NextFunction, Request, Response } from "express";
import { CurrentDateGenerator } from "../../../core/adapters/current-date-generator";
import { RandomIDGenerator } from "../../../core/adapters/random-id-generator";
import { OrganizeConference } from "../../../conference/usecases/organize-conference";
import { createConferenceInput } from "../dto/conference.dto";
import { ValidatorRequest } from "../utils/validate-request";
import { InMemoryConferenceRepository } from "../../../conference/adapters/in-memory-conference-repository";

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
        return res.jsonError(errors, 400)
      }

      const result = await usecase.execute({
        user: req.user,
        title: input.title,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        seats: input.seats
      })

      return res.jsonSuccess(result, 201)
    } catch (error) {
      next(error);
    }
};