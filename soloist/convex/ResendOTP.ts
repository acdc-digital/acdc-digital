import Resend from "@auth/core/providers/resend";
import { Resend as ResendAPI } from "resend";
import { generateRandomString, alphabet } from "oslo/crypto";

export const ResendOTP = Resend({
  id: "resend-otp",
  apiKey: process.env.AUTH_RESEND_KEY,
  async generateVerificationToken() {
    return generateRandomString(8, alphabet("0-9"));
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    console.log("🔴 Starting email verification request for:", email);
    console.log("🔴 API Key available:", !!provider.apiKey);
    console.log("🔴 Generated token:", token);
    
    const resend = new ResendAPI(provider.apiKey);
    
    try {
      const emailData = {
        from: "msimon@acdc.digital", // Using verified account email (Resend free tier restriction)
        to: [email],
        subject: `Verify your email for SoloPro`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; margin-bottom: 10px;">Verify Your Email</h1>
              <p style="color: #666; font-size: 16px;">Welcome to SoloPro! Please verify your email address to continue.</p>
            </div>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
              <h2 style="color: #333; margin-bottom: 10px;">Your verification code is:</h2>
              <div style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 4px; font-family: monospace;">
                ${token}
              </div>
            </div>
            
            <div style="background-color: #fef3f2; border: 1px solid #fecaca; padding: 15px; border-radius: 6px; margin-bottom: 30px;">
              <p style="color: #dc2626; margin: 0; font-size: 14px;">
                <strong>Important:</strong> This code will expire in 15 minutes. If you didn't request this verification, please ignore this email.
              </p>
            </div>
            
            <div style="text-align: center; color: #666; font-size: 14px;">
              <p>If you're having trouble, please contact our support team.</p>
              <p style="margin-top: 20px;">
                Best regards,<br>
                The SoloPro Team
              </p>
            </div>
          </div>
        `,
        text: `
          Welcome to SoloPro!
          
          Your email verification code is: ${token}
          
          Please enter this code to verify your email address and complete your account setup.
          
          This code will expire in 15 minutes. If you didn't request this verification, please ignore this email.
          
          Best regards,
          The SoloPro Team
        `,
      };
      
      console.log("🔴 Sending email with data:", JSON.stringify(emailData, null, 2));
      
      const result = await resend.emails.send(emailData);
      
      console.log("🔴 Resend result:", result);
      
      if (result.error) {
        console.error("🔴 Resend API error:", JSON.stringify(result.error, null, 2));
        throw new Error(`Resend API error: ${JSON.stringify(result.error)}`);
      }
      
      console.log("🔴 Email sent successfully, ID:", result.data?.id);
      
    } catch (error) {
      console.error("🔴 Failed to send verification email - Full error:", error);
      console.error("🔴 Error message:", error instanceof Error ? error.message : String(error));
      console.error("🔴 Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      
      // Try to extract useful error information
      let errorMessage = "Could not send verification email";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = JSON.stringify(error);
      } else {
        errorMessage = String(error);
      }
      
      throw new Error(`Email verification failed: ${errorMessage}`);
    }
  },
}); 