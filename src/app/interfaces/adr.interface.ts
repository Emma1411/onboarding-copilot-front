export type AdrStatus = 'proposed' | 'accepted' | 'rejected' | 'superseded';

export interface AdrSummary {
  id: number;
  title: string;
  status: AdrStatus | null;
  date: string | null;
  tags: string[];
  summary: string;
  file: string;
}

export interface AdrDetail extends AdrSummary {
  content: string;
}