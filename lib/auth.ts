
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { env } from "./env";
import { emailOTP } from "better-auth/plugins"
import { sendVerificationEmail } from "./mailer";
import { admin } from "better-auth/plugins";

// If your Prisma file is located elsewhere, you can change the path

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "sqlite", ...etc
    }),
    socialProviders: {
        github: {
            clientId: env.AUTH_GITHUB_CLIENT_ID,
            clientSecret: env.AUTH_GITHUB_CLIENT_SECRET,
        },
        google: {
            clientId: env.AUTH_GOOGLE_CLIENT_ID,
            clientSecret: env.AUTH_GOOGLE_CLIENT_SECRET,
        },
    },

    plugins: [
        emailOTP({
            async sendVerificationOTP({ email, otp }) {
                // Send verification email using nodemailer with beautiful template
                await sendVerificationEmail({
                    to: email,
                    otp: otp,
                });
            },
        }),
        admin(),
    ],
});