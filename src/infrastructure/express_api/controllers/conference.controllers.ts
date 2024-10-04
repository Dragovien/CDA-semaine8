import { NextFunction, Request, Response } from "express";
import { bookConferenceInput, changeConferenceDatesInput, changeConferenceSeatsInput, createConferenceInput } from "../dto/conference.dto";
import { ValidatorRequest } from "../utils/validate-request";
import { AwilixContainer } from "awilix";
import { ChangeSeats } from "../../../conference/usecases/change-seats";
import { ChangeDates } from "../../../conference/usecases/change-dates";
import { OrganizeConference } from "../../../conference/usecases/organize-conference";
import { BookConferencePlace } from "../../../conference/usecases/book-place";

export const organizeConference = (container: AwilixContainer) => {
  return async (req: Request, res: Response, next: NextFunction)=> {
    try {
      const body = req.body as createConferenceInput

      const {errors, input} = await ValidatorRequest(createConferenceInput, body)

      if(errors) {       
        return res.jsonError(errors, 400)
      }

      const result = await (container.resolve('organizeConference') as OrganizeConference).execute({
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

export const changeConferenceSeats = (container: AwilixContainer) => {
  return async (req: Request, res: Response, next: NextFunction)=> {
    try {
      const {id} = req.params
      const body = req.body as changeConferenceSeatsInput

      const {errors, input} = await ValidatorRequest(changeConferenceSeatsInput, body)

      if(errors) {  
        return res.jsonError(errors, 400)
      }

      await (container.resolve('changeSeats') as ChangeSeats).execute({
        user: req.user,
        conferenceId: id,
        seats: input.seats
      })

      return res.jsonSuccess({message: "The number of seats was changed correctly"}, 200)
    } catch (error) {
      next(error);
    }
};
}

export const changeConferenceDates = (container: AwilixContainer) => {
  return async (req: Request, res: Response, next: NextFunction)=> {
    try {
      const {id} = req.params
      const body = req.body as changeConferenceDatesInput

      const {errors, input} = await ValidatorRequest(changeConferenceDatesInput, body)

      if(errors) {  
        return res.jsonError(errors, 400)
      }

      await (container.resolve('changeDates') as ChangeDates).execute({
        user: req.user,
        conferenceId: id,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
      })

      return res.jsonSuccess({message: "The dates of the conference were updated correctly"}, 200)
    } catch (error) {
      next(error);
    }
};
}

export const bookConference = (container: AwilixContainer) => {
  return async (req: Request, res: Response, next: NextFunction)=> {
    try {
      const {id} = req.params
      const body = req.body as bookConferenceInput

      const {errors, input} = await ValidatorRequest(bookConferenceInput, body)

      if(errors) {  
        return res.jsonError(errors, 400)
      }

      const result = await (container.resolve('bookConference') as BookConferencePlace).execute({
        userId: input.userId,
        conferenceId: id,
      })

      return res.jsonSuccess(result, 201)
    } catch (error) {
      next(error);
    }
};
}