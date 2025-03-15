// packages/functions/src/email/sender.ts
import { Resource } from "sst";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

const client = new SESv2Client();

export async function sendEmail(to: string, subject: string, body: string) {
  const command = new SendEmailCommand({
    FromEmailAddress: Resource.EmailServer.sender,
    Destination: { ToAddresses: [to], CcAddresses: [], BccAddresses: [] },
    Content: {
      Simple: {
        Subject: { Data: subject },
        Body: { Text: { Data: body } },
      },
    },
  });

  try {
    const response = await client.send(command);
    console.log(`Email sent to ${to}: ${response.MessageId}`);
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    throw error; // Notify caller of failure
  }
}