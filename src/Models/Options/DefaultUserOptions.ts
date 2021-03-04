import { User, UserRole, UserStatus } from "../Database/User";
// TODO: Switch to dependency injection/Json format
/** Default User Options. */
export class DefaultUserOptions {
  readonly createDefaultUser: boolean;
  readonly user: User | null;

  /** Gets server options from .env file */
  constructor() {
    if (process.env.CREATEDEFAULTUSER != null) {
      this.createDefaultUser = Boolean(process.env.CREATEDEFAULTUSER);
    } else {
      this.createDefaultUser = true;
    }
    if (this.createDefaultUser) {
      this.user = {
        firstName: "Default",
        lastName: "Admin",
        email: "admin@ridgewalker.michaelketzner.com",
        password: "password",
        role: UserRole.Admin,
        status: UserStatus.Approved,
        address: {
          line1: "1234",
          line2: "",
          city: "Murfreesboro",
          state: "TN",
          zipCode: 37130,
        },
        phoneNumber: "+1 (888) 888-8888",
        nssNumber: 1234567,
        LastPaid: new Date(),
        privateFields: {},
      } as User;
    } else {
      this.user = null;
    }
  }
}
