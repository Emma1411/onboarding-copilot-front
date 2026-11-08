export type AskMode = 'ai' | 'sources_only' | 'no_answer';

export interface Source {
  file: string;
  heading: string;
  text: string;
}

export interface AskMeta {
  passages: number;
  tokens: number | null;
  llmMs: number | null;
  durationMs: number;
  model: string | null;
}

export interface AskResponse {
  mode: AskMode;
  answer: string | null;
  sources: Source[];
  meta: AskMeta;
  cached?: boolean;
}

export type AskErrorCode =
  | 'rate_limited'
  | 'question_too_short'
  | 'invalid_question'
  | 'network'
  | 'server';

export interface AskError {
  code: AskErrorCode;
  message: string;
}