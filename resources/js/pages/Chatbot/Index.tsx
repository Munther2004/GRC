import axios from 'axios';
import { Sparkles, Send, RotateCcw, User, AlertCircle } from 'lucide-react';
import type { KeyboardEvent } from 'react';
import { useRef, useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';

// ─── Types ────────────────────────────────────────────────────────────────────

type Message = {
    role: 'user' | 'assistant';
    content: string;
    error?: boolean;
};

type ContextSnapshot = {
    snapshot_taken_at: string;
    controls: {
        total: number;
        compliant: number;
        non_compliant: number;
        partially_compliant: number;
        compliance_percentage: number;
    };
    risks: {
        total_open: number;
        overdue: number;
    };
    assessments: {
        overdue: number;
    };
};

type Props = {
    context: ContextSnapshot;
};

// ─── Suggestion chips ────────────────────────────────────────────────────────

const SUGGESTIONS = [
    'What needs my attention today?',
    'Which controls have been non-compliant the longest?',
    'Summarize my top risks this month',
    'What is my current compliance status?',
] as const;

// ─── Inline markdown renderer ────────────────────────────────────────────────

function renderInline(text: string): React.ReactNode[] {
    // Handle **bold** spans
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
            return (
                <strong key={i} className="font-semibold">
                    {part.slice(2, -2)}
                </strong>
            );
        }
        return <span key={i}>{part}</span>;
    });
}

function MarkdownText({ text }: { text: string }) {
    if (!text || typeof text !== 'string') return null;
    const lines = text.split('\n');
    const nodes: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        // Blank line — skip
        if (!line.trim()) {
            i++;
            continue;
        }

        // Bullet list — collect consecutive items
        if (/^[-*•]\s+/.test(line)) {
            const items: string[] = [];
            while (i < lines.length && /^[-*•]\s+/.test(lines[i])) {
                items.push(lines[i].replace(/^[-*•]\s+/, ''));
                i++;
            }
            nodes.push(
                <ul
                    key={`ul-${i}`}
                    className="my-1.5 ml-5 list-disc space-y-0.5 text-sm"
                >
                    {items.map((item, j) => (
                        <li key={j}>{renderInline(item)}</li>
                    ))}
                </ul>,
            );
            continue;
        }

        // Numbered list — collect consecutive items
        if (/^\d+[.)]\s+/.test(line)) {
            const items: string[] = [];
            while (i < lines.length && /^\d+[.)]\s+/.test(lines[i])) {
                items.push(lines[i].replace(/^\d+[.)]\s+/, ''));
                i++;
            }
            nodes.push(
                <ol
                    key={`ol-${i}`}
                    className="my-1.5 ml-5 list-decimal space-y-0.5 text-sm"
                >
                    {items.map((item, j) => (
                        <li key={j}>{renderInline(item)}</li>
                    ))}
                </ol>,
            );
            continue;
        }

        // Normal paragraph
        nodes.push(
            <p key={`p-${i}`} className="mb-1.5 text-sm last:mb-0">
                {renderInline(line)}
            </p>,
        );
        i++;
    }

    return <div>{nodes}</div>;
}

// ─── Message bubbles ─────────────────────────────────────────────────────────

function UserBubble({ content }: { content: string }) {
    return (
        <div className="flex justify-end">
            <div className="flex max-w-[80%] items-end gap-2">
                <div className="rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                    {content}
                </div>
                <div className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
            </div>
        </div>
    );
}

function AssistantBubble({
    content,
    error,
}: {
    content: string;
    error?: boolean;
}) {
    return (
        <div className="flex justify-start">
            <div className="flex max-w-[85%] items-end gap-2">
                <div
                    className={`mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${ error ? 'bg-destructive/10' : 'bg-primary/10' }`}
                >
                    {error ? (
                        <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                    ) : (
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                    )}
                </div>
                <div
                    className={`rounded-2xl rounded-bl-sm px-4 py-2.5 ${ error ? 'border border-destructive/20 bg-destructive/10 text-destructive-foreground' : 'bg-muted text-foreground' }`}
                >
                    <MarkdownText text={content ?? ''} />
                </div>
            </div>
        </div>
    );
}

function TypingIndicator() {
    return (
        <div className="flex justify-start">
            <div className="flex items-end gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:300ms]" />
                </div>
            </div>
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ChatbotIndex({ context }: Props) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [snapshotTime, setSnapshotTime] = useState(context.snapshot_taken_at);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const overdue =
        (context.risks.overdue ?? 0) + (context.assessments.overdue ?? 0);

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    // Auto-resize textarea
    useEffect(() => {
        const ta = textareaRef.current;
        if (!ta) return;
        ta.style.height = 'auto';
        ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
    }, [input]);

    const sendMessage = useCallback(
        async (text: string) => {
            const trimmed = text.trim();
            if (!trimmed || isLoading) return;

            const userMsg: Message = { role: 'user', content: trimmed };
            const history = messages.map((m) => ({
                role: m.role,
                content: m.content,
            }));

            setMessages((prev) => [...prev, userMsg]);
            setInput('');
            setIsLoading(true);

            try {
                const res = await axios.post('/chatbot/chat', {
                    message: trimmed,
                    history,
                });
                const data = res.data;

                setMessages((prev) => [
                    ...prev,
                    {
                        role: 'assistant',
                        content: data.reply ?? '',
                        error: data.error === true,
                    },
                ]);

                if (data.snapshot_taken_at) {
                    setSnapshotTime(data.snapshot_taken_at);
                }
            } catch {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: 'assistant',
                        content:
                            'Connection error — please check your network and try again.',
                        error: true,
                    },
                ]);
            } finally {
                setIsLoading(false);
                textareaRef.current?.focus();
            }
        },
        [messages, isLoading],
    );

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

    const clearChat = () => {
        setMessages([]);
        setInput('');
        textareaRef.current?.focus();
    };

    // Format snapshot timestamp
    const formatTime = (iso: string) => {
        try {
            return new Date(iso).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return iso;
        }
    };

    const complianceColor =
        context.controls.compliance_percentage >= 80
            ? 'text-green-500'
            : context.controls.compliance_percentage >= 50
              ? 'text-yellow-500'
              : 'text-red-500';

    return (
        <AdminLayout>
            <div className="mx-auto flex h-[calc(100vh-7rem)] max-w-4xl flex-col gap-4">
                {/* ── Header ── */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <h1 className="text-xl font-semibold tracking-tight">
                                AI Compliance Assistant
                            </h1>
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            Ask anything about your GRC posture
                        </p>
                    </div>

                    {messages.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearChat}
                            className="flex shrink-0 items-center gap-1.5"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Clear
                        </Button>
                    )}
                </div>

                {/* ── Context summary bar ── */}
                <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/40 px-4 py-2.5 text-sm">
                    <span className="mr-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Live context:
                    </span>
                    <Badge
                        variant="outline"
                        className={`text-xs font-medium ${complianceColor} border-current`}
                    >
                        {context.controls.compliance_percentage}% compliant
                    </Badge>
                    <Badge
                        variant="outline"
                        className="border-orange-500/30 text-xs font-medium text-orange-500"
                    >
                        {context.risks.total_open} open risks
                    </Badge>
                    {overdue > 0 && (
                        <Badge
                            variant="outline"
                            className="border-red-500/30 text-xs font-medium text-red-500"
                        >
                            {overdue} overdue item{overdue !== 1 ? 's' : ''}
                        </Badge>
                    )}
                </div>

                {/* ── Chat area ── */}
                <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
                    <CardContent className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
                        {/* Empty state — suggestion chips */}
                        {messages.length === 0 && (
                            <div className="flex h-full flex-col items-center justify-center gap-6 py-8">
                                <div className="space-y-1 text-center">
                                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                        <Sparkles className="h-6 w-6 text-primary" />
                                    </div>
                                    <p className="font-heading text-lg font-normal">
                                        How can I help you today?
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        I have access to your live risk,
                                        control, and compliance data.
                                    </p>
                                </div>

                                <div className="grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
                                    {SUGGESTIONS.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => sendMessage(s)}
                                            disabled={isLoading}
                                            className="rounded-xl border bg-card px-4 py-3 text-left text-sm transition-colors hover:border-primary/30 hover:bg-accent disabled:opacity-50"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Message history */}
                        {messages.map((msg, idx) =>
                            msg.role === 'user' ? (
                                <UserBubble key={idx} content={msg.content} />
                            ) : (
                                <AssistantBubble
                                    key={idx}
                                    content={msg.content}
                                    error={msg.error}
                                />
                            ),
                        )}

                        {/* Typing indicator */}
                        {isLoading && <TypingIndicator />}

                        <div ref={messagesEndRef} />
                    </CardContent>

                    {/* ── Input area ── */}
                    <div className="flex items-end gap-2 border-t p-3">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                            rows={1}
                            placeholder="Ask me about your risks, controls, compliance status…"
                            className="max-h-[120px] min-h-[40px] flex-1 resize-none rounded-lg border bg-transparent px-3 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus:border-primary disabled:opacity-50"
                        />
                        <Button
                            size="icon"
                            onClick={() => sendMessage(input)}
                            disabled={isLoading || !input.trim()}
                            className="h-10 w-10 shrink-0"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </Card>

                {/* ── Snapshot footnote ── */}
                <p className="pb-1 text-center text-xs text-muted-foreground">
                    Based on data snapshot taken at {formatTime(snapshotTime)}
                </p>
            </div>
        </AdminLayout>
    );
}
