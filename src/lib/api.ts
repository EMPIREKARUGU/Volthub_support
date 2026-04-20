const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ✅ Generate a session ID when the app loads and keep it
const SESSION_ID = crypto.randomUUID();

export interface AskRequest {
  question: string;
  session_id?: string;
}

export interface AskResponse {
  answer: string;
  question: string;
  request_id: string;
  session_id: string;
  timestamp: string;
}

export async function askQuestion(payload: AskRequest): Promise<AskResponse> {
  const response = await fetch(`${API_URL}/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...payload,
      session_id: SESSION_ID,  // ✅ always send the same session ID
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<AskResponse>;
}