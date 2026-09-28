const { ClientSecretCredential } = require('@azure/identity');
const { Client } = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch'); // Required for Microsoft Graph Client

/**
 * Initialize the Microsoft Graph Client using Client Credentials flow
 * @returns {Client} Authenticated Microsoft Graph Client
 */
const getAuthenticatedClient = () => {
  const tenantId = process.env.MICROSOFT_TENANT_ID;
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error('Microsoft Graph configuration is incomplete. Please set MICROSOFT_TENANT_ID, MICROSOFT_CLIENT_ID, and MICROSOFT_CLIENT_SECRET in your .env file.');
  }

  // Create Azure Identity credential
  const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);

  // Initialize Graph Client
  const client = Client.initWithMiddleware({
    debugLogging: false,
    authProvider: {
      getAccessToken: async () => {
        const tokenResponse = await credential.getToken('https://graph.microsoft.com/.default');
        return tokenResponse.token;
      }
    }
  });

  return client;
};

/**
 * Send an email via Microsoft Graph API
 * @param {Object} options Email options (same signature as nodemailer fallback)
 * @param {String} options.email Recipient email address(es) (comma separated or array)
 * @param {String} options.subject Email subject
 * @param {String} options.html HTML email content
 * @param {String} options.message Plain text email content fallback
 * @returns {Object} response indicating success
 */
const sendGraphEmail = async (options) => {
  const senderEmail = process.env.MICROSOFT_GRAPH_SENDER_EMAIL;
  
  if (!senderEmail) {
    throw new Error('MICROSOFT_GRAPH_SENDER_EMAIL is not configured in your .env file.');
  }

  const client = getAuthenticatedClient();

  // Handle recipients (array or comma-separated string)
  const recipients = Array.isArray(options.email) 
    ? options.email 
    : options.email.split(',').map(e => e.trim());

  const toRecipients = recipients.map(email => ({
    emailAddress: {
      address: email
    }
  }));

  // Construct Graph message object
  const message = {
    subject: options.subject,
    body: {
      contentType: options.html ? 'HTML' : 'Text',
      content: options.html || options.message
    },
    toRecipients
  };

  try {
    // Send email using Application Permissions (Mail.Send)
    await client.api(`/users/${senderEmail}/sendMail`)
      .post({
        message,
        saveToSentItems: true
      });

    return { success: true, provider: 'Microsoft Graph', messageId: `graph-${Date.now()}` };
  } catch (error) {
    console.error('Failed to send email via Microsoft Graph:', error);
    if (error.statusCode === 403) {
      throw new Error('Microsoft Graph authentication configuration exists, but Mail.Send application permission/admin consent is required.');
    }
    throw new Error(`Graph API Email Error: ${error.message}`);
  }
};

/**
 * Test the Microsoft Graph authentication
 */
const testGraphAuthentication = async () => {
  try {
    const client = getAuthenticatedClient();
    // A simple safe test call - we won't actually query users since it requires User.Read.All, 
    // but initializing the client and attempting to get a token is enough to test auth.
    // Instead of making a risky API call, we just force the token acquisition.
    const tenantId = process.env.MICROSOFT_TENANT_ID;
    const clientId = process.env.MICROSOFT_CLIENT_ID;
    const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
    
    const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
    await credential.getToken('https://graph.microsoft.com/.default');
    
    return {
      success: true,
      provider: 'Microsoft Graph',
      authentication: 'successful'
    };
  } catch (err) {
    return {
      success: false,
      provider: 'Microsoft Graph',
      error: err.message
    };
  }
};

module.exports = {
  getAuthenticatedClient,
  sendGraphEmail,
  testGraphAuthentication
};
