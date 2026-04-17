const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface AskRequest {
  question: string;
}

export interface AskResponse {
  answer: string;
  question: string;
  request_id: string;
  timestamp: string;
}

export async function askQuestion(payload: AskRequest): Promise<AskResponse> {
  const response = await fetch(`${API_URL}/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<AskResponse>;
}