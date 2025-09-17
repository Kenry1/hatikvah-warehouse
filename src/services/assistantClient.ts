export interface ChatMessage { role: 'user' | 'assistant' | 'system'; content: string; }
export interface ChatResponse { reply: string; action?: any; }

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export async function sendChat(messages: ChatMessage[], mode: 'default' | 'request' = 'request'): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/api/assistant/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, mode })
  });
  if (!res.ok) {
    throw new Error(`Chat request failed: ${res.status}`);
  }
  return res.json();
}

export async function sendChatStream(messages: ChatMessage[], onChunk: (text: string) => void): Promise<{ full: string; action?: any }> {
  const res = await fetch(`${API_BASE}/api/assistant/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages })
  });
  if (!res.body) throw new Error('No stream body');
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let full = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = dec.decode(value, { stream: true });
    full += chunk;
    onChunk(chunk);
  }
  let action; const match = full.match(/\[ACTION_JSON\]([\s\S]*?)\[\/ACTION_JSON\]/);
  if (match) { try { action = JSON.parse(match[1]); } catch {} }
  return { full, action };
}
