"use server";

import crypto from "crypto";
import { db } from "@/lib/db";
import { resend, EMAIL_FROM } from "@/lib/email";
import { SITE_CONFIG } from "@/config/site";
import VerificationEmail from "@/../emails/verification-email";
import type { ActionResponse } from "@/types";

const TOKEN_EXPIRY_HOURS = 24;
const RESEND_COOLDOWN_MS = 60_000; // 1 minute

/**
 * Send a verification email to a user.
 * Creates a hashed token in VerificationToken and sends an email via Resend.
 */
export async function sendVerificationEmail(
  userId: string,
  email: string,
  locale: "it" | "en" = "it"
): Promise<ActionResponse> {
  try {
    const rawToken = crypto.randomUUID();
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const expires = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    // Remove any existing tokens and create new one atomically
    await db.$transaction([
      db.verificationToken.deleteMany({
        where: { identifier: email },
      }),
      db.verificationToken.create({
        data: {
          identifier: email,
          token: hashedToken,
          expires,
        },
      }),
    ]);

    const verificationUrl = `${SITE_CONFIG.url}/${locale}/verify-email?token=${rawToken}&email=${encodeURIComponent(email)}`;

    await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject:
        locale === "it"
          ? "Verifica il tuo indirizzo email — Scoutica"
          : "Verify your email address — Scoutica",
      react: VerificationEmail({ verificationUrl, locale }),
    });

    return { success: true };
  } catch (error) {
    console.error("Send verification email error:", error);
    return { success: false, error: "Failed to send verification email" };
  }
}

/**
 * Verify an email token. Compares hashed token, checks expiry,
 * sets User.emailVerified, and deletes the token.
 */
export async function verifyEmail(
  token: string,
  email: string
): Promise<ActionResponse> {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const storedToken = await db.verificationToken.findFirst({
      where: {
        identifier: email,
        token: hashedToken,
      },
    });

    if (!storedToken) {
      return { success: false, error: "invalidToken" };
    }

    if (storedToken.expires < new Date()) {
      // Clean up expired token
      await db.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: email,
            token: hashedToken,
          },
        },
      });
      return { success: false, error: "tokenExpired" };
    }

    // Set emailVerified and delete token in a transaction
    await db.$transaction([
      db.user.update({
        where: { email },
        data: { emailVerified: new Date() },
      }),
      db.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: email,
            token: hashedToken,
          },
        },
      }),
    ]);

    return { success: true };
  } catch (error) {
    console.error("Verify email error:", error);
    return { success: false, error: "verificationFailed" };
  }
}

/**
 * Resend verification email with rate limiting (1 per minute).
 */
export async function resendVerificationEmail(
  email: string,
  locale: "it" | "en" = "it"
): Promise<ActionResponse> {
  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal whether the email exists
      return { success: true };
    }

    if (user.emailVerified) {
      return { success: false, error: "alreadyVerified" };
    }

    // Check rate limit: if a token was created less than 1 minute ago, deny
    const recentToken = await db.verificationToken.findFirst({
      where: { identifier: email },
    });

    if (recentToken) {
      const tokenAge = Date.now() - (recentToken.expires.getTime() - TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
      if (tokenAge < RESEND_COOLDOWN_MS) {
        return { success: false, error: "rateLimited" };
      }
    }

    return sendVerificationEmail(user.id, email, locale);
  } catch (error) {
    console.error("Resend verification email error:", error);
    return { success: false, error: "Failed to resend verification email" };
  }
}
