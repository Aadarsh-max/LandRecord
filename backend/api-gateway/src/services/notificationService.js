import nodemailer from "nodemailer";

const EMAIL_ENABLED = !!process.env.SMTP_USER && !!process.env.SMTP_PASS;

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return transporter;
}

async function sendViaSmtp(toEmail, subject, message) {
  const client = getTransporter();
  return client.sendMail({
    from: `"BhuLekh AI" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject,
    text: message,
    html: `<p>${message.replace(/\n/g, "<br/>")}</p>`
  });
}

function sendMock(toEmail, subject, message) {
  console.log(`[notification:mock] To: ${toEmail} | Subject: ${subject} | Message: ${message}`);
  return Promise.resolve({ messageId: "mock-" + Date.now() });
}

export async function sendNotification(toEmail, subject, message) {
  if (!toEmail) {
    console.log("[notification] No email on file, skipping.");
    return { status: "skipped", reason: "no_email" };
  }

  try {
    if (EMAIL_ENABLED) {
      const result = await sendViaSmtp(toEmail, subject, message);
      return { status: "sent", provider: "smtp", messageId: result.messageId };
    } else {
      const result = await sendMock(toEmail, subject, message);
      return { status: "sent", provider: "mock", messageId: result.messageId };
    }
  } catch (error) {
    console.error("Notification send failed:", error.message);
    return { status: "failed", error: error.message };
  }
}

export function buildDigitizationMessage(landownerName, surveyNumber) {
  return {
    subject: "Your Land Record Has Been Digitized",
    body: `Dear ${landownerName || "Landowner"},\n\nYour land record (Survey No. ${surveyNumber || "N/A"}) has been digitized and is available for review.\n\n- BhuLekh AI`
  };
}

export function buildVerificationMessage(landownerName, surveyNumber) {
  return {
    subject: "Your Land Record Has Been Verified",
    body: `Dear ${landownerName || "Landowner"},\n\nYour land record (Survey No. ${surveyNumber || "N/A"}) has been verified and updated.\n\n- BhuLekh AI`
  };
}