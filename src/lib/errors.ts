// Messages for the error codes the login endpoints return (BaseError in wealth-common).
const MESSAGES: Record<string, string> = {
  "602": "Email or password is incorrect.",
  "607": "Secret key is incorrect.",
  "629": "Enter your email address.",
  "640": "Enter a valid email address.",
  "637": "Enter your password.",
  "611": "The request was not valid.",
  "676": "An account with this email already exists.",
  "6001": "Password must be at least 10 characters.",
  "6002": "Password is too long.",
  "6003": "Too many attempts. Please wait 15 minutes and try again.",
  "6004": "Only the account owner can do this.",
  "601": "No account was found for that email.",
};

export function messageFor(code: string | null | undefined): string {
  return (code && MESSAGES[code]) || "Something went wrong. Please try again.";
}

export function httpStatusFor(code: string | null | undefined): number {
  if (code === "602") return 401;
  if (code === "6003") return 429;
  return 400;
}
