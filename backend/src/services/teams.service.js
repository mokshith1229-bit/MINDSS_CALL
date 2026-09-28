const { getAuthenticatedClient } = require('./microsoftGraph.service');

/**
 * Creates a Teams chat (1:1 or group) and sends a notification message.
 * @param {Array<String>} emails - Array of user emails (UPNs) to include in the chat.
 * @param {Object} notificationData - Data for the Teams message
 * @param {String} notificationData.title - Title of the notification
 * @param {String} notificationData.body - Main content
 * @param {String} notificationData.link - Optional link (e.g., to MINDScall proposal)
 */
const sendTeamsNotification = async (emails, notificationData) => {
  const senderEmail = process.env.MICROSOFT_GRAPH_SENDER_EMAIL;
  
  if (!senderEmail) {
    throw new Error('MICROSOFT_GRAPH_SENDER_EMAIL is missing. Required for Teams sender identity.');
  }

  // Deduplicate and filter emails, ensuring sender is included as an owner
  const uniqueEmails = [...new Set([senderEmail, ...emails])];

  const client = getAuthenticatedClient();

  try {
    // 1. Create the Chat (1:1 or Group)
    const chatType = uniqueEmails.length === 2 ? 'oneOnOne' : 'group';
    
    const members = uniqueEmails.map(email => ({
      '@odata.type': '#microsoft.graph.aadUserConversationMember',
      roles: ['owner'],
      'user@odata.bind': `https://graph.microsoft.com/v1.0/users('${email}')`
    }));

    const chatPayload = {
      chatType,
      members
    };

    if (chatType === 'group') {
      chatPayload.topic = 'MINDScall Notification';
    }

    const chatResponse = await client.api('/chats').post(chatPayload);
    const chatId = chatResponse.id;

    // 2. Format the message
    // Using Adaptive Cards or plain HTML for Teams
    const messageContent = `
      <h3>${notificationData.title}</h3>
      <p>${notificationData.body.replace(/\n/g, '<br/>')}</p>
      ${notificationData.link ? `<br/><a href="${notificationData.link}">Open MINDScall</a>` : ''}
    `;

    const messagePayload = {
      body: {
        contentType: 'html',
        content: messageContent
      }
    };

    // 3. Send the message to the created/resolved chat
    await client.api(`/chats/${chatId}/messages`).post(messagePayload);

    return { success: true, provider: 'Microsoft Teams', chatId };
  } catch (error) {
    console.error('Failed to send Teams notification:', error);
    throw new Error(`Teams API Error: ${error.message}`);
  }
};

module.exports = {
  sendTeamsNotification
};
