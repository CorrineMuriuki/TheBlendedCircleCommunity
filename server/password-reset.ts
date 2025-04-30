import { db } from './db';
import { passwordResetTokens, users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import { hash } from 'bcrypt';

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Generate a password reset token and send it via email
 */
export async function requestPasswordReset(email: string) {
  // Find user by email
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (!user) {
    throw new Error('User not found');
  }

  // Generate a unique token
  const token = uuidv4();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

  // Store the token in the database
  await db.insert(passwordResetTokens).values({
    userId: user.id,
    token,
    expiresAt,
  });

  // Send reset email
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: user.email,
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset for your account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  });

  return { success: true };
}

/**
 * Reset password using a valid token
 */
export async function resetPassword(token: string, newPassword: string) {
  // Find the token
  const [resetToken] = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.token, token));

  if (!resetToken) {
    throw new Error('Invalid or expired token');
  }

  // Check if token has expired
  if (new Date() > resetToken.expiresAt) {
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.id, resetToken.id));
    throw new Error('Token has expired');
  }

  // Hash the new password
  const hashedPassword = await hash(newPassword, 10);

  // Update user's password
  await db
    .update(users)
    .set({ password: hashedPassword })
    .where(eq(users.id, resetToken.userId));

  // Delete the used token
  await db
    .delete(passwordResetTokens)
    .where(eq(passwordResetTokens.id, resetToken.id));

  return { success: true };
} 