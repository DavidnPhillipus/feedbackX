import crypto from "crypto";
import prisma from "../prisma.js";

const RESET_TTL_MS = 60 * 60 * 1000;

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function createPasswordResetToken(userId: number): Promise<string> {
  await prisma.passwordResetToken.deleteMany({ where: { userId } });

  const token = generateResetToken();
  await prisma.passwordResetToken.create({
    data: {
      token,
      userId,
      expiresAt: new Date(Date.now() + RESET_TTL_MS),
    },
  });

  return token;
}

export function buildResetUrl(token: string): string {
  const base = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
  return `${base}/ResetPassword?token=${encodeURIComponent(token)}`;
}
