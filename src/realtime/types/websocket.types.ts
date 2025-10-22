import { Socket } from 'socket.io';

export interface AuthenticatedSocket extends Socket {
  sessionCode?: string;
  teamId?: string;
}

export interface QuestionDto {
  id: string;
  text: string;
  type: 'MCQ' | 'TF';
  choices?: Array<{id: string, text: string}>;
  timeLimitSec: number;
  points: number;
}

export interface ScoreUpdatePayload {
  leaderboard: Array<{teamName: string, score: number, rank: number}>;
  questionId: string;
}

export interface QuizEndPayload {
  finalLeaderboard: Array<{teamName: string, score: number, rank: number}>;
  totalQuestions: number;
  sessionDuration: number;
}

export interface QuestionStartEvent {
  event: 'question_start';
  data: {
    id: string;
    text: string;
    type: 'MCQ' | 'TF';
    choices?: Array<{ id: string; text: string }>;
    timeLimit: number;
    points: number;
  };
}

export interface ScoreUpdateEvent {
  event: 'score_update';
  data: {
    leaderboard: Array<{ teamName: string; score: number; rank: number }>;
    questionId: string;
  };
}

export interface QuizEndEvent {
  event: 'quiz_end';
  data: {
    finalLeaderboard: Array<{ teamName: string; score: number; rank: number }>;
    totalQuestions: number;
    sessionDuration: number;
  };
}

export interface JoinSessionPayload {
  sessionCode: string;
  teamToken: string;
}

export interface AnswerSubmissionEvent {
  event: 'answer_submission';
  data: {
    questionId: string;
    answerId: string;
    isCorrect: boolean;
    points: number;
  };
}

export interface GameStateEvent {
  event: 'game_state';
  data: {
    currentState: 'waiting' | 'in_progress' | 'completed';
    currentQuestionId?: string;
    timeRemaining?: number;
  };
}