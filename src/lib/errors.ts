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
