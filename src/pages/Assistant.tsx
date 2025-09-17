import { useState, useEffect, useContext, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Bot, User, CheckCircle2, XCircle } from 'lucide-react';
import { AuthContext } from '@/contexts/AuthContext';
import { fetchWarehouseMaterials, fetchMaterialRequestSites, submitMaterialRequest, DraftMaterialRequest } from '@/services/materialRequests';
import { sendChat } from '@/services/assistantClient';
import { startAssistantSession, saveAssistantMessage } from '@/services/assistantSessions';
import { useToast } from '@/hooks/use-toast';

interface Message { id: string; role: 'user' | 'assistant' | 'system'; content: string; meta?: any; }

type Step = 'welcome' | 'site' | 'priority' | 'items' | 'notes' | 'confirm' | 'submitted' | 'disambiguate';

interface MaterialRef { id: string; itemName?: string; materialName?: string; category?: string; unit?: string; availableQuantity?: number; quantity?: number; }

// Placeholder Assistant chat page (Phase 1)
export default function Assistant() {
  const { user } = useContext(AuthContext) || {};
  const { toast } = useToast();

  const [materials, setMaterials] = useState<MaterialRef[]>([]);
  const [siteNames, setSiteNames] = useState<string[]>([]);
  const [step, setStep] = useState<Step>('welcome');
  const [draft, setDraft] = useState<DraftMaterialRequest>({ siteName: '', priority: 'medium', notes: '', items: [] });
  const [messages, setMessages] = useState<Message[]>([{ id: 'welcome', role: 'assistant', content: 'Hi! I\'m your material request assistant. Let\'s create a new material request. Type the site name to begin.' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const [aiMessages, setAiMessages] = useState<Message[]>([]); // separate thread for AI context
  const [streamMode, setStreamMode] = useState(false); // streaming toggle
  const [streaming, setStreaming] = useState(false); // true while streaming response
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Load materials & sites once
  useEffect(() => {
    (async () => {
      try {
        const [mats, sites] = await Promise.all([fetchWarehouseMaterials(), fetchMaterialRequestSites()]);
        setMaterials(mats as any);
        setSiteNames(sites);
        if (user?.id) {
          try {
            const sid = await startAssistantSession(user.id);
            setSessionId(sid);
            await saveAssistantMessage(sid, { role: 'assistant', content: 'Session started' });
          } catch (e) {
            console.error('Failed to start session', e);
          }
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const pushAssistant = async (content: string, meta?: any) => {
    const msg: Message = { id: Date.now() + '-a', role: 'assistant', content, meta };
    setMessages(prev => [...prev, msg]);
    if (sessionId) {
      try { await saveAssistantMessage(sessionId, { role: 'assistant', content, actionType: meta?.action }); } catch {}
    }
  };
  const pushUser = async (content: string) => {
    const msg: Message = { id: Date.now().toString(), role: 'user', content };
    setMessages(prev => [...prev, msg]);
    if (sessionId) {
      try { await saveAssistantMessage(sessionId, { role: 'user', content }); } catch {}
    }
  };

  const summarizeDraft = () => {
    if (!draft.items.length) return 'No items yet.';
    return draft.items.map((i, idx) => `${idx+1}. ${(i.materialId || i.materialName)} x ${i.quantity}`).join('\n');
  };

  const fuzzyFindMaterials = (token: string): MaterialRef[] => {
    if (!token) return [];
    const lower = token.toLowerCase();
    // Exact ID match prioritized first
    const exact = materials.filter(m => m.id.toLowerCase() === lower);
    if (exact.length) return exact;
    // Substring matches on itemName or materialName
    const partial = materials.filter(m =>
      (m.itemName && m.itemName.toLowerCase().includes(lower)) ||
      (m.materialName && m.materialName.toLowerCase().includes(lower))
    );
    return partial.slice(0, 8); // cap to avoid overwhelming list
  };
  const [pendingDisambig, setPendingDisambig] = useState<{ baseToken: string; qty: number } | null>(null);
  const [disambigOptions, setDisambigOptions] = useState<MaterialRef[]>([]);
  // Material category listing flow
  const [awaitingMaterialCategories, setAwaitingMaterialCategories] = useState(false);
  const allCategories = Array.from(new Set(materials.map(m => (m.category || 'Uncategorized')))).sort();

  const parseItemLine = (line: string): { materialToken?: string; qty?: number } => {
    // Accept patterns: ID x QTY, name x QTY, ID qty QTY
    const match = line.match(/(.+?)[\sx]*([xX]|qty|quantity)?\s*(\d+)$/);
    if (match) {
      const materialToken = match[1].trim();
      const qty = parseInt(match[3], 10);
      return { materialToken, qty };
    }
    return {};
  };

  const handleUserInput = useCallback(async (raw: string) => {
  const textRaw = raw.trim();
  if (!textRaw) return;
  const userText = textRaw;
  await pushUser(userText);

    // AI mode commands
  if (userText.toLowerCase() === 'ai on') {
  setAiMode(true);
  await pushAssistant('AI mode enabled. I will augment guidance with Gemini responses.');
      return;
    }
  if (userText.toLowerCase() === 'ai off') {
  setAiMode(false);
  await pushAssistant('AI mode disabled. Using local rule-based guidance only.');
      return;
    }

  // Session lifecycle commands
  if (userText.toLowerCase() === 'end session') {
    if (!sessionId) { await pushAssistant('No active session.'); return; }
    // Mark closed (fire-and-forget to keep UI snappy)
    try {
      await (await import('@/services/assistantSessions')).updateAssistantSession(sessionId, { status: 'closed' });
      await pushAssistant('Session ended. Type "new session" to start a fresh one.');
    } catch {
      await pushAssistant('Failed to end session (already closed or network issue).');
    }
    return;
  }
  if (userText.toLowerCase() === 'new session') {
    if (sessionId) {
      try { await (await import('@/services/assistantSessions')).updateAssistantSession(sessionId, { status: 'closed' }); } catch {}
    }
    if (user?.id) {
      try {
        const sid = await startAssistantSession(user.id);
        setSessionId(sid);
        setMessages([{ id: 'welcome', role: 'assistant', content: 'New session started. Provide the site name to begin.' }]);
        setDraft({ siteName: '', priority: 'medium', notes: '', items: [] });
        setStep('site');
        await pushAssistant('Ready. Provide a site name.');
      } catch (e) {
        await pushAssistant('Could not start new session.');
      }
    } else {
      await pushAssistant('You must be logged in to start a session.');
    }
    return;
  }

  if (userText.toLowerCase() === 'stream on') {
    setStreamMode(true);
    await pushAssistant('Streaming mode enabled. AI replies will appear progressively.');
    return;
  }
  if (userText.toLowerCase() === 'stream off') {
    setStreamMode(false);
    await pushAssistant('Streaming mode disabled. AI replies will be shown after processing.');
    return;
  }

  const lower = userText.toLowerCase();

    // Material listing command: 'list materials' optionally with categories
    if (lower.startsWith('list materials')) {
      // Extract categories after command
      const remainder = userText.slice(14).trim(); // length of 'list materials'
      if (remainder) {
        // Parse comma/space separated categories
        const requested = remainder.split(/[,]/).map(s => s.trim()).filter(Boolean);
        const matchedCats = allCategories.filter(c => requested.some(r => c.toLowerCase().includes(r.toLowerCase())));
        if (!matchedCats.length) {
          await pushAssistant('No categories matched. Available categories:\n' + allCategories.join(', '));
          return;
        }
        const lines: string[] = [];
        matchedCats.forEach(cat => {
          const catMats = materials.filter(m => (m.category || 'Uncategorized') === cat).slice(0, 50);
          lines.push(`Category: ${cat}`);
          if (!catMats.length) lines.push('  (no materials)');
          catMats.forEach(mat => lines.push(`  - ${mat.id} | ${(mat.itemName || mat.materialName || '')} | Qty: ${mat.availableQuantity ?? 'n/a'}`));
        });
        await pushAssistant(lines.join('\n'));
        return;
      }
      // Ask user which categories
      setAwaitingMaterialCategories(true);
      await pushAssistant('Enter category names separated by commas, or type "all" for every category. Available:\n' + allCategories.join(', '));
      return;
    }

    // Handle category list response while awaitingMaterialCategories
    if (awaitingMaterialCategories) {
      if (lower === 'cancel') { setAwaitingMaterialCategories(false); await pushAssistant('Material listing cancelled.'); return; }
      let selectedCats: string[] = [];
      if (lower === 'all') {
        selectedCats = allCategories;
      } else {
        const parts = userText.split(/[,]/).map(s => s.trim()).filter(Boolean);
        selectedCats = allCategories.filter(c => parts.some(p => c.toLowerCase().includes(p.toLowerCase())));
      }
      if (!selectedCats.length) { await pushAssistant('No categories matched. Try again or type cancel.'); return; }
      const lines: string[] = [];
      selectedCats.forEach(cat => {
        const catMats = materials.filter(m => (m.category || 'Uncategorized') === cat).slice(0, 50);
        lines.push(`Category: ${cat}`);
        if (!catMats.length) lines.push('  (no materials)');
        catMats.forEach(mat => lines.push(`  - ${mat.id} | ${(mat.itemName || mat.materialName || '')} | Qty: ${mat.availableQuantity ?? 'n/a'}`));
      });
      await pushAssistant(lines.join('\n'));
      setAwaitingMaterialCategories(false);
      return;
    }

    if (lower === 'cancel') {
      setDraft({ siteName: '', priority: 'medium', notes: '', items: [] });
      setStep('site');
  await pushAssistant('Draft cleared. Provide a site name to start again.');
      return;
    }

    if (step === 'welcome' || step === 'site') {
      setDraft(d => ({ ...d, siteName: userText }));
      setStep('priority');
  await pushAssistant(`Site set to "${userText}". Choose priority: low | medium | high | urgent`);
      return;
    }

    if (step === 'priority') {
  const allowed = ['low','medium','high','urgent'];
  if (!allowed.includes(lower)) {
  await pushAssistant('Invalid priority. Please type: low | medium | high | urgent');
        return;
      }
      setDraft(d => ({ ...d, priority: lower as any }));
      setStep('items');
  await pushAssistant('Priority saved. Now add items. Format examples:\nMTR-1001 x 5\nsteel bolt x 20\nType "done" when finished or "list" to review.');
      return;
    }

  if (step === 'disambiguate') {
      // Expecting a number selection or cancel
      if (/^cancel$/i.test(lower)) {
        setPendingDisambig(null);
        setDisambigOptions([]);
        setStep('items');
        await pushAssistant('Disambiguation cancelled. Continue adding items.');
        return;
      }
      const choiceIdx = parseInt(lower, 10);
      if (!isNaN(choiceIdx) && choiceIdx >= 1 && choiceIdx <= disambigOptions.length && pendingDisambig) {
        const chosen = disambigOptions[choiceIdx - 1];
        setDraft(d => ({ ...d, items: [...d.items, { materialId: chosen.id, materialName: chosen.itemName || chosen.materialName || pendingDisambig.baseToken, quantity: pendingDisambig.qty }] }));
        setPendingDisambig(null);
        setDisambigOptions([]);
        setStep('items');
        await pushAssistant(`Added ${chosen.id} x ${pendingDisambig.qty}. Add more, type "list", or "done".`);
        return;
      }
      await pushAssistant('Please choose a number from the list, or type cancel to abort.');
      return;
    }

  if (step === 'items') {
      if (lower === 'list') {
  await pushAssistant('Current items:\n' + summarizeDraft());
        return;
      }
      if (lower === 'done') {
  if (!draft.items.length) { await pushAssistant('You have no items yet. Add at least one.'); return; }
        setStep('notes');
  await pushAssistant('Add optional notes or type "skip" to continue.');
        return;
      }
  const { materialToken, qty } = parseItemLine(userText);
      if (!materialToken || !qty) {
  await pushAssistant('Could not parse that. Try: MATERIAL_ID x QTY or Name x QTY. Example: cable-12 x 10');
        return;
      }
      const matches = fuzzyFindMaterials(materialToken);
      if (!matches.length) { await pushAssistant(`No material matched "${materialToken}". Try a different name or ID.`); return; }
      if (matches.length === 1) {
        const found = matches[0];
        const id = found.id;
        setDraft(d => ({ ...d, items: [...d.items, { materialId: id, materialName: found.itemName || found.materialName || materialToken, quantity: qty }] }));
        await pushAssistant(`Added ${id} x ${qty}. Add more, type "list", or "done".`);
        return;
      }
      // multiple matches -> enter disambiguation step
      setPendingDisambig({ baseToken: materialToken, qty });
      setDisambigOptions(matches);
      setStep('disambiguate');
      await pushAssistant('Multiple matches found:\n' + matches.map((m,i)=> `${i+1}. ${m.id} - ${(m.itemName||m.materialName||'')}`).join('\n') + '\nType the number to select or cancel');
      return;
    }

    if (step === 'notes') {
      if (lower !== 'skip') {
        setDraft(d => ({ ...d, notes: userText }));
      }
      setStep('confirm');
  await pushAssistant('Review draft:\nSite: ' + draft.siteName + '\nPriority: ' + draft.priority + '\nItems:\n' + summarizeDraft() + (userText && lower !== 'skip' ? ('\nNotes: ' + userText) : '') + '\nType "submit" to create request or "cancel" to abort.');
      return;
    }

  if (step === 'confirm') {
      if (lower === 'submit') {
        if (!user?.id) { pushAssistant('You must be logged in to submit.'); return; }
        const allowedRoles = ['Site Engineer','ICT','Admin','Manager'];
        if (!allowedRoles.includes(user.role)) {
          await pushAssistant(`Your role (${user.role}) is not permitted to submit material requests. Please contact an authorized Site Engineer.`);
          return;
        }
        try {
          setSubmitting(true);
          await submitMaterialRequest(draft, { userId: user.id, username: user.username, role: user.role });
          setStep('submitted');
          await pushAssistant('Request submitted successfully ✅');
          toast({ title: 'Material request submitted', description: 'Your request has been saved.' });
          // Reset after short delay
          setTimeout(() => {
            setDraft({ siteName: '', priority: 'medium', notes: '', items: [] });
            setStep('site');
            pushAssistant('You can start a new request. Provide site name.');
          }, 1500);
        } catch (e: any) {
          await pushAssistant('Submission failed: ' + e.message);
        } finally {
          setSubmitting(false);
        }
        return;
      } else if (lower === 'cancel') {
        setDraft({ siteName: '', priority: 'medium', notes: '', items: [] });
        setStep('site');
  await pushAssistant('Draft cancelled. Provide a new site name to start over.');
        return;
      } else {
  await pushAssistant('Type "submit" to proceed or "cancel" to abort.');
        return;
      }
    }
    // AI augmentation (supports streaming)
    if (aiMode) {
      const userContent = userText;
      const contextMsgs = [...aiMessages.map(m => ({ role: m.role as 'user'|'assistant'|'system', content: m.content })), { role: 'user' as const, content: userContent }];
      const previewDraft = `Current draft:\nSite:${draft.siteName}\nPriority:${draft.priority}\nItems:\n${summarizeDraft()}\nStep:${step}`;
  const fullMessages = [...contextMsgs, { role: 'system' as const, content: previewDraft }];
      try {
        setAiMessages(m => [...m, { id: Date.now()+ '-u', role: 'user', content: userContent }]);
        if (streamMode) {
          setStreaming(true);
          const aiMsgId = Date.now() + '-g';
          setAiMessages(m => [...m, { id: aiMsgId, role: 'assistant', content: '' }]);
          await pushAssistant('[AI] (streaming...)');
          let assembled = '';
          const { action } = await (await import('@/services/assistantClient')).sendChatStream(fullMessages, (chunk) => {
            const cleaned = chunk.replace(/\[ACTION_JSON\][\s\S]*?\[\/ACTION_JSON\]/g, '');
            if (cleaned) {
              assembled += cleaned;
              setAiMessages(curr => curr.map(c => c.id === aiMsgId ? { ...c, content: assembled } : c));
              setMessages(curr => curr.map(c => c.content === '[AI] (streaming...)' ? { ...c, content: '[AI] ' + assembled } : c));
            }
          });
          setStreaming(false);
          if (action && action.action === 'create_request') {
            const updates: string[] = [];
            setDraft(d => {
              const next = { ...d };
              if (action.siteName && !next.siteName) { next.siteName = action.siteName; updates.push('site'); }
              if (action.priority && ['low','medium','high','urgent'].includes(action.priority) && next.priority !== action.priority) { next.priority = action.priority; updates.push('priority'); }
              if (Array.isArray(action.items)) {
                const existing = new Set(next.items.map(i => i.materialId));
                action.items.forEach((it: any) => {
                  if (!it) return;
                  const token = (it.materialId || it.materialName || it.name || '').toString();
                  if (!token) return;
                  const foundList = fuzzyFindMaterials(token);
                  const first = foundList[0];
                  if (first && !existing.has(first.id)) {
                    next.items.push({ materialId: first.id, materialName: first.itemName || first.materialName || token, quantity: Number(it.quantity)||1 });
                    existing.add(first.id);
                  }
                });
                if (next.items.length !== d.items.length) updates.push('items');
              }
              if (action.notes && !next.notes) { next.notes = action.notes; updates.push('notes'); }
              return next;
            });
            if (updates.length) await pushAssistant('[AI] Applied: ' + updates.join(', '));
            await pushAssistant('[AI] Detected submission intent. Type "submit" to finalize or continue editing.');
          }
        } else {
          const response = await sendChat(fullMessages);
          setAiMessages(m => [...m, { id: Date.now()+ '-g', role: 'assistant', content: response.reply }]);
          await pushAssistant('[AI] ' + response.reply);
          if (response.action && response.action.action === 'create_request') {
            const action = response.action;
            const updates: string[] = [];
            setDraft(d => {
              const next = { ...d };
              if (action.siteName && !next.siteName) { next.siteName = action.siteName; updates.push('site'); }
              if (action.priority && ['low','medium','high','urgent'].includes(action.priority) && next.priority !== action.priority) { next.priority = action.priority; updates.push('priority'); }
              if (Array.isArray(action.items)) {
                const existing = new Set(next.items.map(i => i.materialId));
                action.items.forEach((it: any) => {
                  if (!it) return;
                  const token = (it.materialId || it.materialName || it.name || '').toString();
                  if (!token) return;
                  const foundList = fuzzyFindMaterials(token);
                  const first = foundList[0];
                  if (first && !existing.has(first.id)) {
                    next.items.push({ materialId: first.id, materialName: first.itemName || first.materialName || token, quantity: Number(it.quantity)||1 });
                    existing.add(first.id);
                  }
                });
                if (next.items.length !== d.items.length) updates.push('items');
              }
              if (action.notes && !next.notes) { next.notes = action.notes; updates.push('notes'); }
              return next;
            });
            if (updates.length) await pushAssistant('[AI] Applied: ' + updates.join(', '));
            await pushAssistant('[AI] Detected submission intent. Type "submit" to finalize or continue editing.');
          }
        }
      } catch (e: any) {
        setStreaming(false);
        await pushAssistant('[AI Error] ' + e.message);
      }
    }
  }, [step, draft, user, materials, aiMode, aiMessages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    setLoading(true);
    await handleUserInput(text);
    setLoading(false);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto w-full">
  <h1 className="text-2xl font-bold mb-4 flex items-center gap-2"><Bot className="h-6 w-6" /> Assistant (Draft Builder)</h1>
      <Card className="border-muted">
        <CardHeader>
          <CardTitle className="text-lg">Material Request Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col h-[65vh]">
            <ScrollArea className="flex-1 pr-4 border rounded-md p-4 bg-muted/30">
              <div className="space-y-4">
                {messages.map(m => (
                  <div key={m.id} className={`flex items-start gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {m.role !== 'user' && <Bot className="h-5 w-5 mt-1 text-primary" />}
                    <div className={`rounded-lg px-3 py-2 text-sm max-w-[75%] whitespace-pre-wrap shadow-sm ${m.role === 'user' ? 'bg-primary text-primary-foreground ml-auto' : 'bg-background border'}`}>
                      {m.content}
                    </div>
                    {m.role === 'user' && <User className="h-5 w-5 mt-1 text-muted-foreground" />}
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                  </div>
                )}
                {submitting && (
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Loader2 className="h-4 w-4 animate-spin" /> Submitting request...
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="mt-4 flex gap-2">
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                disabled={loading || submitting}
              />
              <Button onClick={sendMessage} disabled={loading || submitting || !input.trim()}>
                <Send className="h-4 w-4 mr-1" /> Send
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Commands: list, list materials, done, cancel, submit, ai on|off, stream on|off, end session, new session.</p>
            <div className="text-xs mt-1">AI Mode: {aiMode ? <span className="text-green-600 font-medium">ON</span> : <span className="text-red-600 font-medium">OFF</span>}</div>
            <div className="text-xs mt-1">Streaming: {streamMode ? <span className="text-green-600 font-medium">ON</span> : <span className="text-red-600 font-medium">OFF</span>} {streaming && <span className="ml-1 text-muted-foreground">(receiving...)</span>}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
