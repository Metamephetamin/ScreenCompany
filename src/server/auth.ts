import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { findUser } from "@/server/store";
import { consumeRateLimit, credentialsSchema, rateLimitKey } from "@/server/security";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Email и пароль",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const limiter = consumeRateLimit(
          rateLimitKey("login", parsed.data.email),
          8,
          15 * 60 * 1000,
        );
        if (!limiter.allowed) return null;

        const user = await findUser(parsed.data.email, parsed.data.password);
        if (!user) return null;
        return { id: user.email, email: user.email, name: user.name };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET ?? "local-mvp-secret-change-me",
};

export const authHandler = NextAuth(authOptions);
