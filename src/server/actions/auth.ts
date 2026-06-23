"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import {
  registerModelSchema,
  registerScoutSchema,
  registerStudioSchema,
  type RegisterModelInput,
  type RegisterScoutInput,
  type RegisterStudioInput,
} from "@/lib/validations/auth";
import { generateTempSlug } from "@/lib/utils";
import { calculateAge } from "@/lib/utils";
import { sendVerificationEmail } from "@/server/actions/email-verification";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { verifyTurnstile, turnstileEnabled } from "@/lib/turnstile";
import type { ActionResponse } from "@/types";

async function rateLimitByIp(
  bucket: "register" | "login" | "passwordReset"
): Promise<{ ok: true } | { ok: false; error: string }> {
  const hdrs = await headers();
  const ip = getClientIp(hdrs);
  const cfg = RATE_LIMITS[bucket];
  const result = await rateLimit(`${bucket}:${ip}`, cfg.limit, cfg.windowMs);
  if (!result.success) {
    return {
      ok: false,
      error: "Troppi tentativi. Riprova tra qualche minuto.",
    };
  }
  return { ok: true };
}

async function verifyCaptcha(
  data: unknown
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!turnstileEnabled()) return { ok: true };
  const token =
    typeof data === "object" && data !== null && "turnstileToken" in data
      ? (data as { turnstileToken?: unknown }).turnstileToken
      : undefined;
  const hdrs = await headers();
  const ip = getClientIp(hdrs);
  const ok = await verifyTurnstile(typeof token === "string" ? token : null, ip);
  if (!ok) return { ok: false, error: "Verifica anti-bot fallita. Riprova." };
  return { ok: true };
}

export async function registerModel(
  data: RegisterModelInput
): Promise<ActionResponse<{ userId: string }>> {
  const t = await getTranslations("serverErrors");
  const rl = await rateLimitByIp("register");
  if (!rl.ok) return { success: false, error: rl.error };
  const cap = await verifyCaptcha(data);
  if (!cap.ok) return { success: false, error: cap.error };
  try {
    const validated = registerModelSchema.parse(data);

    // Server-side age verification
    const dateOfBirth = new Date(validated.dateOfBirth);
    if (isNaN(dateOfBirth.getTime())) {
      return { success: false, error: t("auth.underageRegistration") };
    }
    if (calculateAge(dateOfBirth) < 18) {
      return { success: false, error: t("auth.underageRegistration") };
    }

    // Check if email already exists
    const existing = await db.user.findUnique({ where: { email: validated.email } });
    if (existing) {
      return { success: false, error: t("emailAlreadyRegistered") };
    }

    const hashedPassword = await bcrypt.hash(validated.password, 12);

    const user = await db.user.create({
      data: {
        email: validated.email,
        hashedPassword,
        role: "MODEL",
        termsAcceptedAt: new Date(),
        modelProfile: {
          create: {
            slug: generateTempSlug(),
            dateOfBirth,
            status: "INCOMPLETE",
          },
        },
        subscription: {
          create: {
            plan: "FREE",
            status: "ACTIVE",
          },
        },
      },
    });

    // Send verification email (non-blocking — don't fail registration if email fails)
    await sendVerificationEmail(user.id, validated.email).catch((err) =>
      console.error("Failed to send verification email:", err)
    );

    return { success: true, data: { userId: user.id } };
  } catch (error) {
    console.error("Register model error:", error);
    return { success: false, error: t("registrationError") };
  }
}

export async function registerScout(
  data: RegisterScoutInput
): Promise<ActionResponse<{ userId: string }>> {
  const t = await getTranslations("serverErrors");
  const rl = await rateLimitByIp("register");
  if (!rl.ok) return { success: false, error: rl.error };
  const cap = await verifyCaptcha(data);
  if (!cap.ok) return { success: false, error: cap.error };
  try {
    const validated = registerScoutSchema.parse(data);

    const existing = await db.user.findUnique({ where: { email: validated.email } });
    if (existing) {
      return { success: false, error: t("emailAlreadyRegistered") };
    }

    const hashedPassword = await bcrypt.hash(validated.password, 12);

    const user = await db.user.create({
      data: {
        email: validated.email,
        hashedPassword,
        role: "SCOUT",
        termsAcceptedAt: new Date(),
        scoutProfile: {
          create: {
            subtype: validated.subtype,
            verificationStatus: "PENDING",
          },
        },
        subscription: {
          create: {
            plan: "FREE",
            status: "ACTIVE",
          },
        },
      },
    });

    // Send verification email
    await sendVerificationEmail(user.id, validated.email).catch((err) =>
      console.error("Failed to send verification email:", err)
    );

    return { success: true, data: { userId: user.id } };
  } catch (error) {
    console.error("Register scout error:", error);
    return { success: false, error: t("registrationError") };
  }
}

export async function registerStudio(
  data: RegisterStudioInput
): Promise<ActionResponse<{ userId: string }>> {
  const t = await getTranslations("serverErrors");
  const rl = await rateLimitByIp("register");
  if (!rl.ok) return { success: false, error: rl.error };
  const cap = await verifyCaptcha(data);
  if (!cap.ok) return { success: false, error: cap.error };
  try {
    const validated = registerStudioSchema.parse(data);

    const existing = await db.user.findUnique({ where: { email: validated.email } });
    if (existing) {
      return { success: false, error: t("emailAlreadyRegistered") };
    }

    const hashedPassword = await bcrypt.hash(validated.password, 12);
    const fullName = `${validated.firstName} ${validated.lastName}`;

    const user = await db.user.create({
      data: {
        name: fullName,
        email: validated.email,
        hashedPassword,
        role: "STUDIO",
        termsAcceptedAt: new Date(),
        studioProfile: {
          create: {
            businessName: validated.businessName,
          },
        },
        subscription: {
          create: {
            plan: "FREE",
            status: "ACTIVE",
          },
        },
      },
    });

    // Send verification email (non-blocking — don't fail registration if email fails)
    await sendVerificationEmail(user.id, validated.email).catch((err) =>
      console.error("Failed to send verification email:", err)
    );

    return { success: true, data: { userId: user.id } };
  } catch (error) {
    console.error("Register studio error:", error);
    const message = error instanceof Error ? error.message : t("registrationError");
    return { success: false, error: message };
  }
}

import { auth } from "@/lib/auth";
import crypto from "crypto";
import { Resend } from "resend";

export async function completeOAuthSetup(
  role: string,
  termsAccepted: boolean
): Promise<ActionResponse<{ userId: string }>> {
  const t = await getTranslations("serverErrors");
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: t("unauthorized") };
  }
  if (!termsAccepted) {
    return { success: false, error: "Terms must be accepted" };
  }

  const validRoles = ["MODEL", "SCOUT", "STUDIO"];
  if (!validRoles.includes(role)) {
    return { success: false, error: "Invalid role" };
  }

  try {
    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user) return { success: false, error: t("notFound") };

    // Only allow if terms not yet accepted (first-time OAuth setup)
    if (user.termsAcceptedAt) {
      return { success: true, data: { userId: user.id } };
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        role: role as "MODEL" | "SCOUT" | "STUDIO",
        termsAcceptedAt: new Date(),
      },
    });

    // Create role-specific profile
    if (role === "MODEL") {
      await db.modelProfile.upsert({
        where: { userId: user.id },
        create: { userId: user.id, slug: generateTempSlug(), status: "INCOMPLETE" },
        update: {},
      });
    } else if (role === "SCOUT") {
      await db.scoutProfile.upsert({
        where: { userId: user.id },
        create: { userId: user.id, subtype: "SCOUT", verificationStatus: "PENDING" },
        update: {},
      });
    } else if (role === "STUDIO") {
      await db.studioProfile.upsert({
        where: { userId: user.id },
        create: { userId: user.id },
        update: {},
      });
    }

    // Ensure subscription exists
    await db.subscription.upsert({
      where: { userId: user.id },
      create: { userId: user.id, plan: "FREE", status: "ACTIVE" },
      update: {},
    });

    return { success: true, data: { userId: user.id } };
  } catch (error) {
    console.error("OAuth setup error:", error);
    return { success: false, error: t("genericError") };
  }
}

export async function requestPasswordReset(email: string): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  const rl = await rateLimitByIp("passwordReset");
  if (!rl.ok) return { success: false, error: rl.error };
  try {
    // Always return success to prevent email enumeration
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return { success: true };
    }

    // Generate token and store hashed version
    const token = crypto.randomUUID();
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour

    // Clean up old tokens for this email
    await db.verificationToken.deleteMany({
      where: { identifier: `reset:${email}` },
    });

    await db.verificationToken.create({
      data: {
        identifier: `reset:${email}`,
        token: hashedToken,
        expires,
      },
    });

    // Send reset email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "Scoutica <noreply@scoutica.it>",
      to: email,
      subject: "Reimposta la tua password — Scoutica",
      html: `
        <div style="max-width:560px;margin:0 auto;font-family:sans-serif">
          <h2>Reimposta la tua password</h2>
          <p>Hai richiesto di reimpostare la password del tuo account Scoutica.</p>
          <a href="${resetUrl}" style="display:inline-block;background:#1a1a1a;color:#fff;padding:12px 24px;text-decoration:none;margin:16px 0">Reimposta password</a>
          <p style="color:#666;font-size:14px">Questo link scade tra 1 ora. Se non hai richiesto il reset, ignora questa email.</p>
        </div>
      `,
    }).catch((err) => console.error("Password reset email error:", err));

    return { success: true };
  } catch (error) {
    console.error("Password reset request error:", error);
    return { success: false, error: t("requestSendError") };
  }
}

export async function resetPassword(
  token: string,
  email: string,
  newPassword: string
): Promise<ActionResponse> {
  const t = await getTranslations("serverErrors");
  try {
    if (!token || !email || !newPassword || newPassword.length < 8) {
      return { success: false, error: "Invalid input" };
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const storedToken = await db.verificationToken.findFirst({
      where: {
        identifier: `reset:${email}`,
        token: hashedToken,
        expires: { gt: new Date() },
      },
    });

    if (!storedToken) {
      return { success: false, error: "invalidToken" };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await db.user.update({
      where: { email },
      data: { hashedPassword },
    });

    // Clean up used token
    await db.verificationToken.deleteMany({
      where: { identifier: `reset:${email}` },
    });

    return { success: true };
  } catch (error) {
    console.error("Password reset error:", error);
    return { success: false, error: t("genericError") };
  }
}
