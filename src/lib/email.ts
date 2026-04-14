import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendFraudAlertEmail(
  toEmail: string,
  transactionDetails: {
    merchant: string;
    amount: number;
    date: Date;
    fraudProbability: number;
    location?: string;
  }
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not configured.");
    return false;
  }

  const amountStr = `₹${transactionDetails.amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
  })}`;
  const dateStr = transactionDetails.date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const probStr = (transactionDetails.fraudProbability * 100).toFixed(1) + "%";

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-w-md; margin: auto; border: 1px solid #1e293b; background-color: #020617; color: #f8fafc; padding: 24px; border-radius: 12px;">
      <h2 style="color: #ef4444; margin-top: 0;">🚨 Fintellix Security Alert</h2>
      <p style="font-size: 16px;">We detected a suspicious transaction on your account. Our advanced ML model flagged this activity with a <strong>${probStr}</strong> confidence score.</p>
      
      <div style="background-color: #0f172a; padding: 16px; border-radius: 8px; margin-top: 20px;">
        <h3 style="margin-top: 0; color: #38bdf8;">Transaction Details</h3>
        <p style="margin: 4px 0;"><strong>Merchant:</strong> ${transactionDetails.merchant || "Unknown"}</p>
        <p style="margin: 4px 0;"><strong>Amount:</strong> <span style="font-size: 18px; font-weight: bold;">${amountStr}</span></p>
        <p style="margin: 4px 0;"><strong>Date:</strong> ${dateStr}</p>
        <p style="margin: 4px 0;"><strong>Location:</strong> ${transactionDetails.location || "Online / Unknown"}</p>
      </div>

      <p style="font-size: 14px; color: #94a3b8; margin-top: 24px;">If this was you, you can safely ignore this email. If you do not recognize this transaction, please log into your Fintellix dashboard immediately to secure your account.</p>
    </div>
  `;

  try {
    const data = await resend.emails.send({
      from: "Fintellix Security <onboarding@resend.dev>",
      to: toEmail, // Note: On free tier, this MUST match the Resend account email!
      subject: `🚨 Fraud Alert: Suspicious transaction of ${amountStr}`,
      html: htmlContent,
    });
    
    console.log("Resend Email Sent:", data);
    return true;
  } catch (error) {
    console.error("Failed to send fraud alert email:", error);
    return false;
  }
}
