require('dotenv').config();
const { ClientSecretCredential } = require('@azure/identity');
const { Client } = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');

async function testOutlookEmail() {
  const tenantId = process.env.MICROSOFT_TENANT_ID;
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    console.error('Missing Azure credentials in .env');
    return;
  }

  const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
  const client = Client.initWithMiddleware({
    debugLogging: false,
    authProvider: {
      getAccessToken: async () => {
        const tokenResponse = await credential.getToken('https://graph.microsoft.com/.default');
        return tokenResponse.token;
      }
    }
  });

  const testEmail = process.env.TEST_EMAIL_RECIPIENT || 'test@example.com';
  const senderEmail = process.env.MICROSOFT_GRAPH_SENDER_EMAIL;

  if (!senderEmail) {
    console.error('Missing MICROSOFT_GRAPH_SENDER_EMAIL in .env');
    return;
  }

  console.log(`Attempting to send email via Outlook FROM ${senderEmail} TO ${testEmail}...`);

  try {
    const sendMailPayload = {
      message: {
        subject: 'MINDScall - Test Outlook Email',
        body: {
          contentType: 'HTML',
          content: '<p>This is a test email sent from the MINDScall backend via Microsoft Graph API (Outlook).</p>'
        },
        toRecipients: [
          {
            emailAddress: {
              address: testEmail
            }
          }
        ]
      },
      saveToSentItems: 'false'
    };

    await client.api(`/users/${senderEmail}/sendMail`).post(sendMailPayload);
    console.log('✅ OUTLOOK EMAIL SUCCESS! The Mail.Send permission is active and working.');

  } catch (err) {
    console.error('❌ OUTLOOK EMAIL FAILED!');
    console.error('Error:', err.message);
    if (err.body) console.error(JSON.stringify(err.body, null, 2));
  }
}

testOutlookEmail();
