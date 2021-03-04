/* eslint-disable no-invalid-this */
import {
  getModelForClass,
  modelOptions,
  pre,
  prop,
} from "@typegoose/typegoose";
import * as bcrypt from "bcrypt";
import { UserValidator } from "./Validators/UserValidator";
import * as googlelibphonenumber from "google-libphonenumber";
import * as mongoose from "mongoose";
const phoneUtil = googlelibphonenumber.PhoneNumberUtil.getInstance();
const PNF = googlelibphonenumber.PhoneNumberFormat;

/** If true, it hides the values from non admins. */
export class PrivateFields {
  @prop({ default: true, type: Boolean })
  email!: boolean;
  @prop({ default: true, type: Boolean })
  address!: boolean;
  @prop({ default: false, type: Boolean })
  city!: boolean;
  @prop({ default: true, type: Boolean })
  state!: boolean;
  @prop({ default: true, type: Boolean })
  zipCode!: boolean;
  @prop({ default: true, type: Boolean })
  phoneNumber!: boolean;
}

/** Address class */
export class Address {
  @prop({ required: true, type: String })
  line1!: string;
  @prop({ required: false, type: String })
  line2?: string;
  @prop({ required: true, type: String })
  city!: string;
  @prop({ required: true, type: String })
  state!: string;
  @prop({ required: true, type: Number })
  zipCode!: number;
}

/**
 * Define user roles.
 *
 * @member Admin - Manage everything, see hidden user data, approve/reject cave submissions, etc.
 * @member User - Has access to all of the data.
 */
export enum UserRole {
  // eslint-disable-next-line no-unused-vars
  Admin = "Admin",
  // eslint-disable-next-line no-unused-vars
  User = "User",
}

/**
 * Defines user status.
 *
 * @member Pending - does not have access to anything accept to log in/view/update their data.
 * @member Approved - has access to everything according to their role.
 * @member Rejected - same as pending accept it says they are rejected.
 */
export enum UserStatus {
  // eslint-disable-next-line no-unused-vars
  Pending = "Pending",
  // eslint-disable-next-line no-unused-vars
  Approved = "Approved",
  // eslint-disable-next-line no-unused-vars
  Rejected = "Rejected",
}
@modelOptions({
  schemaOptions: { timestamps: true },
  options: { customName: "User" },
})
@pre<User>("save", async function (next) {
  if (this.isModified()) {
    this.increment();
  }
  if (this.isModified("password")) {
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
  }
  if (this.isModified("phoneNumber")) {
    const phoneNumber = phoneUtil.parse(this.phoneNumber);
    this.phoneNumber = phoneUtil.format(phoneNumber, PNF.E164);
  }
  next();
})

/** User class */
export class User {
  @prop()
  _id!: mongoose.Types.ObjectId;
  @prop({ required: true, type: String })
  firstName!: string;
  @prop({ required: true, type: String })
  lastName!: string;
  @prop({
    required: true,
    unique: true,
    type: String,
    index: true,
    validate: {
      validator: UserValidator.isValidEmail,
    },
  })
  email!: string;
  @prop({ required: true, type: String })
  password!: string;
  @prop({ required: true, enum: UserRole })
  role!: UserRole;
  @prop({ required: true, enum: UserStatus })
  status!: UserStatus;
  @prop({ required: true, type: Address })
  address!: Address;
  @prop({
    required: true,
    type: String,
    validate: {
      validator: UserValidator.isValidPhoneNumber,
    },
  })
  phoneNumber!: string;
  @prop({ required: true, type: Number })
  nssNumber!: number;
  @prop({ default: convertDateToUTC(new Date()), type: Date })
  LastPaid!: Date;
  @prop({ required: true, type: PrivateFields })
  privateFields!: PrivateFields;

  /**
   * Compares plain text password with hashed password.
   *
   * @param {sring} password - Plain text password.
   * @returns {Promise<boolean>} - True if valid.
   */
  public async isValidPassword(password: string): Promise<boolean> {
    const isValid = await bcrypt.compare(password, this.password);
    return isValid;
  }
  /**
   * Generates users full name.
   *
   * @returns {string} - Users full name.
   */
  public fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

const userModel = getModelForClass(User);
export { userModel as UserModel };

// TODO: Move this somewhere else.
/**
 * Converts date to utc date.
 *
 * @param {Date} date - Date object o convert
 * @returns {date} - In utc
 */
function convertDateToUTC(date: Date): Date {
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  );
}
