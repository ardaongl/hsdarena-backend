export const DEFAULT_QUESTION_TIME_LIMIT = 300; // 5 dakika varsayılan süre

export interface QuizQuestion {
  index: number;
  text: string;
  type: 'MCQ' | 'TF';
  choices?: Array<{ id: string; text: string }>;
  correctAnswer: { id?: string; value?: boolean };
  timeLimitSec: number;
  points: number;
}

export interface QuizSettings {
  bonusMax: number;
}

export interface CreateQuizDto {
  title: string;
  settings: QuizSettings;
  questions: QuizQuestion[];
}
