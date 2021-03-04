import { DocumentType } from "@typegoose/typegoose";
import { classToPlain } from "class-transformer";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import * as jwt from "jsonwebtoken";
import { User } from "../Models/Database/User";
import { ServerOptions } from "../Models/Options/ServerOptions";
import { UserRepository } from "../Repositories/UserRepository/UserRepository";
import { AuthenticationError } from "../Routes/Authentication/Models/AuthenticationError";
import {
  AuthenticationRequest,
  IUserAuthenticationResponse,
  JwtTokenContent,
} from "../Routes/Authentication/Models/AuthenticationRouteModels";

/** A collection of functions for authentication. */
export namespace AuthenticationService {
  /**
   * Validates a user exists and that the supplied email/password are correct.
   *
   * @param {AuthenticationRequest} authRequest - Request from user
   * @returns {Promise<IUserAuthenticationResponse>} - Jwt token for accessing
   *   secure APIs.
   */
  export async function loginUserAndGetJwt(
    authRequest: AuthenticationRequest
  ): Promise<IUserAuthenticationResponse> {
    const user = await UserRepository.getByEmail<DocumentType<User>>(
      authRequest.email
    );

    // validate email/password
    if (user == null) throw new AuthenticationError("Email does not exist!");
    if (!(await user.isValidPassword(authRequest.password))) {
      throw new AuthenticationError("Password is incorrect!");
    }

    const tokenContent = classToPlain(
      new JwtTokenContent(user._id.toHexString(), user.fullName(), user.role)
    );

    const serverOptions = new ServerOptions();

    const response = {
      token: jwt.sign(tokenContent, serverOptions.jwtSecret),
    } as IUserAuthenticationResponse;

    return response;
  }

  /**
   * Verifies that a JWT token is valid
   *
   * @param {string} token - The jwt token to verify
   * @returns {boolean} - Returns true if the token is valid.
   */
  function verifyJwtAndGetuser(token: string): JwtTokenContent {
    const serverOptions = new ServerOptions();

    // throws an error if invalid
    try {
      const result = jwt.verify(token, serverOptions.jwtSecret, {});
      return result as JwtTokenContent;
    } catch (error) {
      throw new AuthenticationError("The JWT is invalid");
    }
  }

  /**
   * Express middleware that verifies that a user has access to a route.
   *
   * @param {Request<
   *   ParamsDictionary,
   *   any,
   *   any,
   *   QueryString.ParsedQs,
   *   Record<string, any>
   * >} request
   *   The express request.
   * @param {Response<any, Record<string, any>, number>} response The express response.
   * @param {NextFunction} next The next middlware,
   * @returns {void}
   */
  export const VerifyUser: RequestHandler = async (request, response, next) => {
    try {
      // verify that user sent token along with request
      const headers = request.headers;
      if (headers.authorization && headers.authorization.startsWith("Bearer")) {
        const token = headers.authorization.split(" ")[1];

        // this will cause an exception if the jwt is invalid
        const user = verifyJwtAndGetuser(token);

        // TODO: Add typing for authenticated request
        request.body.user = user; // attach user to request body
        next();
      } else {
        throw new AuthenticationError(
          "Your request must contain the param token."
        );
      }
    } catch (error) {
      response.statusCode = StatusCodes.UNAUTHORIZED;
      if (error instanceof AuthenticationError) {
        response.send(error.message);
      } else {
        response.send(error);
      }
    }
  };
}
