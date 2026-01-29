import { BaseUserInfo } from "./user";

export enum DHBCQuizDifficultyLevel {
  EASY = 1,
  QUITE_HARD = 2,
  REALLY_HARD = 3,
  SPECIAL = 4,
}

export enum DHBCQuizWordExplanationType {
  WORD = 1,
  IMAGE = 2,
}

export enum DHBCQuizSubmissionStatus {
  UNDONE = 0,
  DONE = 1,
}

export interface DHBCQuiz {
  id: number;
  date: string;
  difficulty_level: DHBCQuizDifficultyLevel;
  created_at: string;
  words: DHBCQuizWord[];
}

export interface DHBCQuizWord {
  id: string;
  quiz: number;
  index: number;
  image_url: string;
  word?: string;
  variants?: string;
  explanation?: string;
  explanation_type?: DHBCQuizWordExplanationType;
  created_at: string;
}

export interface DHBCQuizSubmission {
  id: number;
  quiz: number;
  user: BaseUserInfo;
  total_trial: number;
  status: DHBCQuizSubmissionStatus;
  created_at: string;

  allTimeStats?: {
    totalSuccess: number;
    avgTrials?: number;
  };
}
