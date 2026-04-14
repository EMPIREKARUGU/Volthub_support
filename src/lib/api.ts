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
  const response = await fetch("/api/ask", {
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
