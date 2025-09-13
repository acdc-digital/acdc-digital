// Resend integration - will be configured with environment variables
interface EmailData {
  to: string;
  subject: string;
  html: string;
}

export const resend = {
  // Placeholder for Resend integration
  // In production, this would use @convex-dev/resend package
  sendBatch: async (emails: EmailData[]) => {
    console.log("Demo: Would send emails:", emails.length);
    return emails.map((_email, index) => ({ id: `demo-${index}`, status: 'sent' }));
  }
};