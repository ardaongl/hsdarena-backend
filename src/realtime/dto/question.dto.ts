import { QuestionType } from './quiz-events.dto';

export interface QuestionDto {
  id: string;
  text: string;
  type: QuestionType;
  choices?: Array<{id: string, text: string}>;
  timeLimitSec: number;
  points: number;
}
