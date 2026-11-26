import { ERROR_CODE, MESSAGES } from "./constants";

// Messages for the error codes the login endpoints return (BaseError in wealth-common).
const CODE_MESSAGES: Record<string, string> = {
  [ERROR_CODE.wrongCredentials]: "Email or password is incorrect.",
  "607": "Secret key is incorrect.",
  "629": "Enter your email address.",
  "640": "Enter a valid email address.",
  "637": "Enter your password.",
  [ERROR_CODE.invalidRequest]: "The request was not valid.",
  "676": "An account with this email already exists.",
  "6001": "Password must be at least 10 characters.",
  "6002": "Password is too long.",
  [ERROR_CODE.tooManyAttempts]: "Too many attempts. Please wait 15 minutes and try again.",
  "6004": "Only the account owner can do this.",
  "6005": "The admin role always sees every menu.",
  "6006": "That role does not exist.",
  "6007": "That menu does not exist.",
  "6008": "Choose at least one menu.",
  "6009": "That account was not found.",
  "6010": "That address is not valid. Use http:// or https:// and a host, for example http://172.27.99.226:8080.",
  "6011": "Nothing answered UP at that address, so it was not saved.",
  "6012": "That is not a valid host and port. Use host:port, for example redis.example.com:6379. Kafka accepts a comma-separated list.",
  "6013": "The username or password is not valid: it is too long or has hidden characters.",
  "6014": "A password cannot be saved: the server has no WEALTH_CONFIG_KEY to encrypt it with.",
  "6016": "Choose the parent menu too: a submenu cannot be on without it.",
  "6017": "A role with that name already exists.",
  "6018": "There must be at least one admin, so the last admin cannot be changed.",
  "6019": "You cannot change your own role.",
  "6020": "Give the role a name of 1 to 40 characters with at least 2 letters or digits.",
  "6021": "Check the provider details: a short name (letters, digits, dashes), a label and an http or https address; the priority is 1 to 99.",
  "6022": "That provider was not found.",
  "6023": "Fill in the API key, client code, PIN, TOTP secret and MAC address first.",
  "6024": "The broker did not return your holdings. Check the login details, then try again.",
  "601": "No account was found for that email.",
};

export function messageFor(code: string | null | undefined): string {
  return (code && CODE_MESSAGES[code]) || MESSAGES.somethingWrong;
}

export function httpStatusFor(code: string | null | undefined): number {
  if (code === ERROR_CODE.wrongCredentials) return 401;
  if (code === ERROR_CODE.tooManyAttempts) return 429;
  return 400;
}
