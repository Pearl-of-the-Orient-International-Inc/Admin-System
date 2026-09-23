import { api } from "@/lib/http-client";
import type { SurveyFeedbackResponseList } from "./survey-feedback.types";

export async function getSurveyFeedbackResponses() {
  const { data } = await api.get<SurveyFeedbackResponseList>("/survey-feedback/responses");
  return data;
}
