import { Logger, LogLevel } from "../../Services/LogService";
// TODO: Switch to dependency injection/Json format
/** Server Options. */
export class ServerOptions {
  readonly mongoConnectionString: string;
  readonly jwtSecret: string;
  readonly port: number;
  readonly runEnviorment: RunEnviorment;

  /** Gets server options from .env file */
  constructor() {
    if (process.env.MONGOCONNECTIONSTRING != null) {
      this.mongoConnectionString = process.env.MONGOCONNECTIONSTRING;
    } else {
      const error = Error("No mongo connection string.");
      Logger.log(error.message, LogLevel.Fatal);
      throw error;
    }
    if (process.env.PORT != null) {
      this.port = Number.parseInt(process.env.PORT);
    } else {
      const error = Error("No port specified!");
      Logger.log(error.message, LogLevel.Fatal);
      throw error;
    }
    const runEnv = process.env.RUNENVIORMENT;
    if (
      runEnv != null &&
      (runEnv == RunEnviorment.Development ||
        runEnv == RunEnviorment.Production)
    ) {
      this.runEnviorment = runEnv;
    } else {
      this.runEnviorment = RunEnviorment.Development;
    }
    if (process.env.JWTSECRET) {
      this.jwtSecret = process.env.JWTSECRET;
    } else {
      this.jwtSecret = "jwtSecret";
      Logger.log("Using default jwt secret!", LogLevel.Warning);
    }
  }
}

export enum RunEnviorment {
  // eslint-disable-next-line no-unused-vars
  Development = "Development",
  // eslint-disable-next-line no-unused-vars
  Production = "Production",
}
