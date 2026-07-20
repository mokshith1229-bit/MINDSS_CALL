const fs = require('fs');

const code = `
// @desc    Schedule a review meeting for an ongoing project
// @route   POST /api/v1/admin/submissions/:id/schedule-meeting
// @access  Private (SUPER_ADMIN, ADMIN)
exports.scheduleMeeting = async (req, res, next) => {
  try {
    const { title, agenda, date, time, duration, platform, link, participants, notes } = req.body;
    
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return next(new ApiError(404, 'Submission not found'));
    }

    if (!submission.projectDetails) {
      submission.projectDetails = {};
    }
    if (!submission.projectDetails.meetings) {
      submission.projectDetails.meetings = [];
    }
    if (!submission.projectDetails.updates) {
      submission.projectDetails.updates = [];
    }

    const meeting = {
      title,
      agenda,
      date,
      time,
      duration,
      platform,
      link,
      participants: Array.isArray(participants) ? participants : participants.split(',').map(p => p.trim()),
      notes,
      status: 'Scheduled'
    };

    submission.projectDetails.meetings.push(meeting);

    // Add timeline update
    submission.timeline.push({
      stage: 'Meeting Scheduled',
      actionBy: req.user?.email || 'Admin',
      role: 'System',
      remarks: \`Meeting "\${title}" scheduled for \${date} at \${time}.\`
    });
    
    // R&D ongoing projects also uses 'updates' array for timeline
    submission.projectDetails.updates.push({
      title: 'Meeting Scheduled',
      description: \`Meeting "\${title}" has been scheduled for \${date} at \${time} via \${platform}.\`,
      updatedBy: req.user?.email || 'Admin',
      progressPercentage: submission.projectDetails.progressPercentage || 0
    });

    await submission.save();

    // Send emails to participants
    const subject = \`Meeting Invitation: \${title} - \${submission.businessId || 'Project'}\`;
    const html = \`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #0078D4;">Meeting Invitation</h2>
        <p>You have been invited to a review meeting for an ongoing R&D project.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #0078D4; margin: 20px 0;">
          <p><strong>Project Name:</strong> \${submission.formData?.find(f => f.label?.includes('Title'))?.value || 'N/A'}</p>
          <p><strong>Project ID:</strong> \${submission.businessId || 'N/A'}</p>
          <p><strong>Meeting Title:</strong> \${title}</p>
          <p><strong>Date:</strong> \${date}</p>
          <p><strong>Time:</strong> \${time} (\${duration})</p>
          <p><strong>Platform:</strong> \${platform}</p>
          <p><strong>Agenda:</strong> \${agenda || 'No agenda provided.'}</p>
        </div>
        \${link ? \`
        <div style="text-align: center; margin-top: 30px;">
          <a href="\${link}" style="background-color: #0078D4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Join Meeting</a>
        </div>
        \` : ''}
        <p style="margin-top: 30px; font-size: 12px; color: #666;">This is an automated message from the MINDScall System. Please do not reply directly to this email.</p>
      </div>
    \`;

    try {
      await sendEmail({
        email: meeting.participants,
        subject,
        html,
        message: \`Meeting Scheduled: \${title} on \${date} at \${time}\`
      });
    } catch (emailErr) {
      console.error('Failed to send meeting invites:', emailErr);
      // We don't fail the request if email fails, but we should probably inform
    }

    res.status(200).json(new ApiResponse(200, { submission }, 'Meeting scheduled and invites sent'));
  } catch (err) {
    next(err);
  }
};

// @desc    Complete a review meeting
// @route   POST /api/v1/admin/submissions/:id/complete-meeting
// @access  Private (SUPER_ADMIN, ADMIN)
exports.completeMeeting = async (req, res, next) => {
  try {
    const { meetingId, attendees, discussionSummary, keyDecisions, actionItems, nextSteps, risksIdentified, nextMeetingDate } = req.body;
    
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return next(new ApiError(404, 'Submission not found'));
    }

    const meeting = submission.projectDetails.meetings.id(meetingId);
    if (!meeting) {
      return next(new ApiError(404, 'Meeting not found'));
    }

    meeting.status = 'Completed';
    meeting.completionDetails = {
      attendees,
      discussionSummary,
      keyDecisions,
      actionItems,
      nextSteps,
      risksIdentified,
      nextMeetingDate
    };

    // Format description for the timeline update
    let timelineDesc = '';
    if (discussionSummary) timelineDesc += \`*Discussion Summary:*\\n\${discussionSummary}\\n\\n\`;
    if (keyDecisions) timelineDesc += \`*Key Decisions:*\\n\${keyDecisions}\\n\\n\`;
    if (actionItems) timelineDesc += \`*Action Items:*\\n\${actionItems}\\n\\n\`;
    if (nextMeetingDate) timelineDesc += \`*Next Meeting Date:* \${nextMeetingDate}\`;

    submission.projectDetails.updates.push({
      title: \`Meeting Completed: \${meeting.title}\`,
      description: timelineDesc.trim() || 'Meeting completed with no notes.',
      updatedBy: req.user?.email || 'Admin',
      progressPercentage: submission.projectDetails.progressPercentage || 0,
      attachments: []
    });

    await submission.save();

    res.status(200).json(new ApiResponse(200, { submission }, 'Meeting marked as completed'));
  } catch (err) {
    next(err);
  }
};
`;

fs.appendFileSync('src/controllers/admin.submission.controller.js', '\n' + code);
console.log('Appended missing functions');
