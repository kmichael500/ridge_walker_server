/* eslint-disable new-cap */
import { IsEmail, IsString, Length } from "class-validator";
import { UserRole } from "../../../Models/Database/User";

// #region Default Post Route

/** Used to verify user login request. */
export class AuthenticationRequest {
  @IsEmail(undefined, { message: "$value is not a valid email!" })
  email!: string;

  @IsString()
  @Length(1, undefined, {
    message: "Password cannot be blank!",
  })
  password!: string;
}

/** Login reponse. */
export interface IUserAuthenticationResponse {
  token: string;
}

/** Contents of the user jwt token */
export class JwtTokenContent {
  @IsString()
  public readonly fullName: string;
  @IsString()
  public readonly _id!: string;
  @IsString()
  public readonly userRole: UserRole;

  /**
   * @param {string} id The user id.
   * @param {string} fullName The users full name.
   * @param {UserRole} userRole The useres role.
   */
  constructor(id: string, fullName: string, userRole: UserRole) {
    this.fullName = fullName;
    this._id = id;
    this.userRole = userRole;
  }
}

// #endregion
