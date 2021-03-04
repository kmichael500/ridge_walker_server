import * as googlelibphonenumber from "google-libphonenumber";
const phoneUtil = googlelibphonenumber.PhoneNumberUtil.getInstance();

/** Contains validation functions for the user model. */
export namespace UserValidator {
  /**
   * Validates an email.
   *
   * @param {string} email - An email address.
   * @returns {boolean} - True if the email is valid.
   */
  export function isValidEmail(email: string): boolean {
    const regex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g;
    return regex.test(email);
  }

  /**
   * Validates a phone number against
   *
   * @param {string} phoneNumber - The phone number to validate.
   * @returns {boolean} - True if the phone number is valid.
   */
  export function isValidPhoneNumber(phoneNumber: string): boolean {
    const googleLibPhoneNumber = phoneUtil.parse(phoneNumber);
    return phoneUtil.isValidNumber(googleLibPhoneNumber);
  }
}
