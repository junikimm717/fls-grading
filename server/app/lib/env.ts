function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}`
    );
  }
  return value;
}

export const FILESDIR = requireEnv("FILESDIR");
export const DICTATOR = requireEnv("DICTATOR");
export const SES_SMTP_HOST = requireEnv("SES_SMTP_HOST");
export const SES_SMTP_USER = requireEnv("SES_SMTP_USER");
export const SES_SMTP_PASS = requireEnv("SES_SMTP_PASS");
