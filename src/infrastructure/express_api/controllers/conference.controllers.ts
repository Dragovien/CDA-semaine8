import { NextFunction, Request, Response } from "express";
import { createConferenceInput } from "../dto/conference.dto";
import { ValidatorRequest } from "../utils/validate-request";
import { AwilixContainer } from "awilix";

export const organizeConference = (container: AwilixContainer) => {
  return async (req: Request, res: Response, next: NextFunction)=> {
    try {
      const body = req.body as createConferenceInput

      const {errors, input} = await ValidatorRequest(createConferenceInput, body)

      if(errors) {       
        return res.jsonError(errors, 400)
      }

      const result = await container.resolve('organizeConference').execute({
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
}