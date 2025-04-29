export interface Note {
  date: string;
  time: string;
  text: string;
}

export interface NoteResponse {
  notes: Note[];
  total: number;
}

export type NoteErrorType = 'NOT_FOUND' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'UNKNOWN_ERROR';

export class NoteError extends Error {
  constructor(message: string, public type: NoteErrorType) {
    super(message);
    this.name = 'NoteError';
  }
}