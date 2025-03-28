import { Resend } from "resend";
import site from "~/utils/config/site";

// Initialize Resend with API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

// Use site config for email details
const FROM_EMAIL = process.env.FROM_EMAIL || site.company.supportEmail;
const SITE_NAME = site.name;
const COMPANY_NAME = site.company.name;

const SITE_URL = process.env.NUXT_PUBLIC_SITE_URL || "http://localhost:3000";

/**
 * Send password reset email
 * @param to Recipient email address
 * @param resetUrl URL with reset token
 * @returns Promise with the email result
 */
export const sendPasswordResetEmail = async (to: string, resetUrl: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `${SITE_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject: "Reset your password",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5; font-size: 24px;">Reset Your Password</h1>
          <p style="font-size: 16px; line-height: 1.5; color: #374151;">
            We received a request to reset your password for your ${SITE_NAME} account.
          </p>
          <p style="font-size: 16px; line-height: 1.5; color: #374151;">
            To reset your password, click the button below:
          </p>
          <div style="margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 16px; line-height: 1.5; color: #374151;">
            If you didn't request this, you can safely ignore this email.
          </p>
          <p style="font-size: 16px; line-height: 1.5; color: #374151;">
            This link will expire in 1 hour.
          </p>
          <p style="font-size: 14px; color: #6B7280; margin-top: 40px; border-top: 1px solid #E5E7EB; padding-top: 20px;">
            &copy; ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.
            <br />
            ${site.company.address} | ${site.company.phone}
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Email sending error:", error);
      throw new Error("Failed to send email");
    }

    return { success: true, data };
  } catch (error) {
    console.error("Email sending error:", error);
    throw error;
  }
};

/**
 * Send password changed confirmation email
 * @param to Recipient email address
 * @returns Promise with the email result
 */
export const sendPasswordChangedEmail = async (to: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `${SITE_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject: "Your password has been changed",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5; font-size: 24px;">Password Changed</h1>
          <p style="font-size: 16px; line-height: 1.5; color: #374151;">
            Your password for ${SITE_NAME} has been successfully changed.
          </p>
          <p style="font-size: 16px; line-height: 1.5; color: #374151;">
            If you did not make this change, please contact our support team immediately at
            <a href="mailto:${site.company.supportEmail}" style="color: #4F46E5; text-decoration: underline;">
              ${site.company.supportEmail}
            </a>.
          </p>
          <div style="margin: 30px 0;">
            <a href="${SITE_URL}/auth/login" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; font-weight: bold;">
              Login to Your Account
            </a>
          </div>
          <p style="font-size: 14px; color: #6B7280; margin-top: 40px; border-top: 1px solid #E5E7EB; padding-top: 20px;">
            &copy; ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.
            <br />
            ${site.company.address} | ${site.company.phone}
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Email sending error:", error);
      throw new Error("Failed to send email");
    }

    return { success: true, data };
  } catch (error) {
    console.error("Email sending error:", error);
    throw error;
  }
};

/**
 * Send email verification email
 * @param to Recipient email address
 * @param verificationUrl URL with verification token
 * @returns Promise with the email result
 */
export const sendVerificationEmail = async (
  to: string,
  verificationUrl: string
) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `${SITE_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject: "Verify your email address",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5; font-size: 24px;">Verify Your Email</h1>
          <p style="font-size: 16px; line-height: 1.5; color: #374151;">
            Thank you for signing up for ${SITE_NAME}. 
          </p>
          <p style="font-size: 16px; line-height: 1.5; color: #374151;">
            Please verify your email address by clicking the button below:
          </p>
          <div style="margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; font-weight: bold;">
              Verify Email
            </a>
          </div>
          <p style="font-size: 16px; line-height: 1.5; color: #374151;">
            If you didn't create an account, you can safely ignore this email.
          </p>
          <p style="font-size: 16px; line-height: 1.5; color: #374151;">
            This link will expire in 24 hours.
          </p>
          <p style="font-size: 14px; color: #6B7280; margin-top: 40px; border-top: 1px solid #E5E7EB; padding-top: 20px;">
            &copy; ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.
            <br />
            ${site.company.address} | ${site.company.phone}
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Email sending error:", error);
      throw new Error("Failed to send email");
    }

    return { success: true, data };
  } catch (error) {
    console.error("Email sending error:", error);
    throw error;
  }
};
