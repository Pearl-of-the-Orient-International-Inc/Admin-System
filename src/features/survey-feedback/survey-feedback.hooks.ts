import { useQuery } from "@tanstack/react-query";
import { getSurveyFeedbackResponses } from "./survey-feedback.api";

export const useSurveyFeedbackResponsesQuery = () =>
  useQuery({
    queryKey: ["survey-feedback", "responses"],
    queryFn: getSurveyFeedbackResponses,
    staleTime: 15_000,
  });
