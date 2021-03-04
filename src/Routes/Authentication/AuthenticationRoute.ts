import { transformAndValidate } from "class-transformer-validator";
import * as express from "express";
import { AuthenticationError } from "./Models/AuthenticationError";
import { AuthenticationRequest } from "./Models/AuthenticationRouteModels";
import { StatusCodes } from "http-status-codes";
import { ValidationError } from "class-validator";
import { AuthenticationService } from "../../Services/AuthenticationService";

const authenticationRoute = express();

/**
 * Lets a user login via email/password.
 *
 * @param {string} email - A users email address
 * @param {string} password - A users password
 * @returns {void} Status code and/or statuscode.
 */
authenticationRoute.post("/", async (request, response) => {
  try {
    const user = (await transformAndValidate(
      AuthenticationRequest,
      request.body
    )) as AuthenticationRequest;

    const token = await AuthenticationService.loginUserAndGetJwt(user);
    response.json(token);
  } catch (error) {
    // bad username/password
    if (error instanceof AuthenticationError) {
      response.statusCode = StatusCodes.UNAUTHORIZED;
      response.send(error.message);

      // bad arguments
    } else if (Array.isArray(error) && error[0] instanceof ValidationError) {
      response.statusCode = StatusCodes.UNPROCESSABLE_ENTITY;

      // TODO: Send back more than one error
      const constraints = error[0].constraints;
      if (constraints) {
        response.send(constraints[Object.keys(constraints)[0]]);
      } else {
        // if the above fails (which it shouldn't, send back the entire object)
        response.send(error);
      }
      // default
    } else {
      response.statusCode = StatusCodes.BAD_REQUEST;
      response.send(error);
    }
  }
});

export { authenticationRoute };
