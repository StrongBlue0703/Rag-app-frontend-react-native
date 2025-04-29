import { Note, NoteResponse, NoteError, NoteErrorType } from "../interfaces/note";
import { BACKEND_URL } from "../config/api";
import axios from "axios";

class NoteApi {
  private apiPrefix: string;

  constructor() {
    this.apiPrefix = `${BACKEND_URL}/notes`;
  }

  private handleError(error: unknown, action: string): never {
    let errorType: NoteErrorType = 'UNKNOWN_ERROR';
    let errorMessage = `Failed to ${action}: Unknown error occurred`;

    if (error instanceof Error) {
      if (error.message.includes('404')) {
        errorType = 'NOT_FOUND';
        errorMessage = `Note not found while trying to ${action}`;
      } else if (error.message.includes('401')) {
        errorType = 'UNAUTHORIZED';
        errorMessage = `Unauthorized: Please log in to ${action}`;
      } else if (error.message.includes('403')) {
        errorType = 'FORBIDDEN';
        errorMessage = `Forbidden: You don't have permission to ${action}`;
      } else {
        errorMessage = `Failed to ${action}: ${error.message}`;
      }
    }

    throw new NoteError(errorMessage, errorType);
  }

  async getNotes(token: string | null): Promise<NoteResponse> {
    try {
      // Pass the token in the request headers so the back-end can identify the current user
      const { data } = await axios.get<Note[]>(this.apiPrefix, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return { notes: data || [], total: (data || []).length };
    } catch (error) {
      this.handleError(error, 'list notes');
      // Return an empty array or rethrow the error based on your error handling strategy
    } 
  }
}