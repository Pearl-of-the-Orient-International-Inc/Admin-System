export type SurveyFeedbackResponse = {
  id: string;
  respondentName: string | null;
  respondentType: string;
  discoverySource: string;
  improvementAreas: string[];
  welcomeRating: number;
  accessibilityRating: number;
  satisfactionRating: number;
  feedback: string;
  hasIssue: boolean;
  issueCategory: string | null;
  issueDescription: string | null;
  contactEmail: string | null;
  createdAt: string;
};

export type SurveyFeedbackResponseList = {
  code: string;
  message: string;
  data: SurveyFeedbackResponse[];
};
