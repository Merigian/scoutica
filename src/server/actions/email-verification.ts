"use server";

import crypto from "crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { resend, EMAIL_FROM } from "@/lib/email";
import { SITE_CONFIG } from "@/config/site";
import VerificationEmail from "@/../emails/verification-email";
import { auth } from "@/lib/auth";
import type { ActionResponse } from "@/types";

const TOKEN_EXPIRY_HOURS = 24;
const RESEND_COOLDOWN_MS = 60_000; // 1 minute

const sendVerificationSchema = z.object({
  userId: z.string().min(1).max(64),
  email: z.string().trim().email().max(200),
  locale: z.enum(["it", "en"]).default("it"),
});

const verifyEmailSchema = z.object({
  token: z.string().min(8).max(256),
  email: z.string().trim().email().max(200),
});

/**
 * Send a verification email to a user.
 * Creates a hashed token in VerificationToken and sends an email via Resend.
 */
export async function sendVerificationEmail(
  userId: string,
  email: string,
  locale: "it" | "en" = "it"
): Promise<ActionResponse> {
  const parsed = sendVerificationSchema.safeParse({ userId, email, locale });
  if (!parsed.success) return { success: false, error: "invalidInput" };
  ({ userId, email, locale } = parsed.data);
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

    const sendResult = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject:
        locale === "it"
          ? "Verifica il tuo indirizzo email — Scoutica"
          : "Verify your email address — Scoutica",
      react: VerificationEmail({ verificationUrl, locale }),
    });

    if (sendResult.error) {
      console.error("[Resend] send failed:", {
        from: EMAIL_FROM,
        to: email,
        error: sendResult.error,
      });
      return { success: false, error: `Resend: ${sendResult.error.message ?? sendResult.error.name ?? "unknown"}` };
    }

    console.log("[Resend] sent OK:", { to: email, id: sendResult.data?.id });
    return { success: true };
  } catch (error) {
    console.error("Send verification email error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to send verification email" };
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
  const parsed = verifyEmailSchema.safeParse({ token, email });
  if (!parsed.success) return { success: false, error: "invalidToken" };
  ({ token, email } = parsed.data);
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

const changeEmailSchema = z.object({
  newEmail: z.string().trim().toLowerCase().email().max(200),
  locale: z.enum(["it", "en"]).default("it"),
});

/**
 * Change the email of the currently signed-in user, only if it hasn't been
 * verified yet. Sends a fresh verification email to the new address.
 */
export async function changeUnverifiedEmail(
  newEmail: string,
  locale: "it" | "en" = "it"
): Promise<ActionResponse<{ email: string }>> {
  const parsed = changeEmailSchema.safeParse({ newEmail, locale });
  if (!parsed.success) return { success: false, error: "invalidEmail" };
  ({ newEmail, locale } = parsed.data);

  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "notAuthenticated" };

  try {
    const me = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, emailVerified: true },
    });
    if (!me) return { success: false, error: "userNotFound" };
    if (me.emailVerified) return { success: false, error: "alreadyVerified" };
    if (me.email === newEmail) return { success: false, error: "sameEmail" };

    const taken = await db.user.findUnique({ where: { email: newEmail }, select: { id: true } });
    if (taken) return { success: false, error: "emailTaken" };

    await db.$transaction([
      db.verificationToken.deleteMany({ where: { identifier: me.email } }),
      db.user.update({ where: { id: me.id }, data: { email: newEmail } }),
    ]);

    const send = await sendVerificationEmail(me.id, newEmail, locale);
    return {
      success: true,
      data: { email: newEmail },
      ...(send.success ? {} : { error: "sendFailed" }),
    } as ActionResponse<{ email: string }>;
  } catch (error) {
    console.error("Change unverified email error:", error);
    return { success: false, error: "changeFailed" };
  }
}
