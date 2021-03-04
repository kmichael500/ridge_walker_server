// load configuration
import { config as dotenvConfig } from "dotenv";
import { DefaultUserOptions } from "./Models/Options/DefaultUserOptions";
import { UserRepository } from "./Repositories/UserRepository/UserRepository";
import "reflect-metadata"; // used for class-transformer, needs to be global
/**
 * Loads configuration files.
 *
 * @returns {void}
 */
export function startup(): void {
  dotenvConfig(); // load enviorment variables from .env file.

  const defaultUserOptions = new DefaultUserOptions();

  if (defaultUserOptions.createDefaultUser) {
    if (defaultUserOptions.user) {
      UserRepository.upsertByEmail(defaultUserOptions.user);
    }
  }
}
