export interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface QuizPart {
  id: number;
  title: string;
  questions: Question[];
}

export enum AppScreen {
  HOME = 'HOME',
  QUIZ = 'QUIZ',
  RESULT = 'RESULT',
}