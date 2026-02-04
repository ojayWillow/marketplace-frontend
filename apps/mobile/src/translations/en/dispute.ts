export const dispute = {
  // Basic
  title: 'Dispute',
  createDispute: 'Create Dispute',
  reason: 'Reason',
  description: 'Description',
  submit: 'Submit',
  cancel: 'Cancel',

  // Status labels
  status: {
    open: 'Open',
    underReview: 'Under Review',
    resolved: 'Resolved',
  },

  // Reason labels
  reasons: {
    workNotCompleted: 'Work Not Completed',
    poorQuality: 'Poor Quality Work',
    taskChanged: 'Task Requirements Changed',
    paymentIssue: 'Payment Issue',
    safetyConcern: 'Safety Concern',
    communication: 'Communication Issue',
    other: 'Other',
  },

  // Info section
  info: {
    disputeStatus: 'Dispute Status',
    filedBy: 'Filed by:',
    you: 'You',
    theOtherParty: 'The other party',
    reason: 'Reason:',
    theirComplaint: 'Their complaint:',
    responseSubmitted: 'Response submitted:',
  },

  // Response form
  responseForm: {
    title: 'Your Response',
    subtitle: 'Explain your side of the story. Be specific and factual.',
    placeholder: 'Describe what happened from your perspective...',
    characterCount: '/ 20 minimum characters',
    submitButton: 'Submit Response',
    cancelButton: 'Cancel',
  },

  // Notices
  notices: {
    respondNotice: 'A dispute has been filed against you. Please respond with your side of the story.',
    respondButton: 'Respond to Dispute',
    waitingNotice: 'Waiting for the other party to respond to your dispute.',
    underReviewNotice: 'Both sides have shared their stories. Support is reviewing this dispute and will reach out soon.',
  },

  // Alerts
  alerts: {
    responseSubmittedTitle: 'Response Submitted',
    responseSubmittedMessage: 'Your response has been submitted. The dispute is now under review by our support team.',
    ok: 'OK',
    error: 'Error',
    errorSubmit: 'Failed to submit response. Please try again.',
    errorMinLength: 'Please provide a detailed response (at least 20 characters).',
  },
};
