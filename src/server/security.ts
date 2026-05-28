import { compareSync, hashSync } from "bcryptjs";
import { z } from "zod";
import { normalizeEmailInput, stripWhitespace } from "@/lib/credentials";

const whitespacePattern = /\s/;
const emailSchema = z
  .string()
  .min(3)
  .max(254)
  .transform(normalizeEmailInput)
  .pipe(z.string().email().refine((value) => !whitespacePattern.test(value), "Пробелы в email запрещены"));

const passwordSchema = z
  .string()
  .min(8, "Пароль должен быть не короче 8 символов")
  .max(128, "Пароль слишком длинный")
  .refine((value) => !whitespacePattern.test(value), "Пробелы в пароле запрещены")
  .refine((value) => /[A-Za-zА-Яа-я]/.test(value), "Добавьте букву")
  .refine((value) => /\d/.test(value), "Добавьте цифру");

export const credentialsSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(8)
    .max(128)
    .refine((value) => !whitespacePattern.test(value), "Пробелы в пароле запрещены"),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  termsAccepted: z.literal(true, {
    error: "Необходимо принять пользовательское соглашение",
  }),
});

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitBucket>();

export { normalizeEmailInput, stripWhitespace };

export function createPasswordHash(password: string) {
  return hashSync(password, 12);
}

export function verifyPassword(password: string, passwordHash: string) {
  return compareSync(password, passwordHash);
}

export function consumeRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (current.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  return { allowed: true, remaining: limit - current.count, resetAt: current.resetAt };
}

export function rateLimitKey(scope: string, identifier: string) {
  return `${scope}:${stripWhitespace(identifier).toLowerCase()}`;
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return { allowed: true };

  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost ?? request.headers.get("host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const protocol = forwardedProto ?? new URL(request.url).protocol.replace(":", "");
  const expectedOrigin = host ? `${protocol}://${host}` : new URL(request.url).origin;

  if (origin === expectedOrigin) return { allowed: true };
  return { allowed: false, error: "Недопустимый источник запроса" };
}
