import AdminLayout from "@/layouts/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Send, RotateCcw, User, AlertCircle } from "lucide-react"
import { useRef, useState, useEffect, useCallback, KeyboardEvent } from "react"
import axios from "axios"

// ─── Types ────────────────────────────────────────────────────────────────────

type Message = {
    role: "user" | "assistant"
    content: string
    error?: boolean
}

type ContextSnapshot = {
    snapshot_taken_at: string
    controls: {
        total: number
        compliant: number
        non_compliant: number
        partially_compliant: number
        compliance_percentage: number
    }
    risks: {
        total_open: number
        overdue: number
    }
    assessments: {
        overdue: number
    }
}

type Props = {
    context: ContextSnapshot
}

// ─── Suggestion chips ────────────────────────────────────────────────────────

const SUGGESTIONS = [
    "What needs my attention today?",
    "Which controls have been non-compliant the longest?",
    "Summarize my top risks this month",
    "What is my current compliance status?",
] as const

// ─── Inline markdown renderer ────────────────────────────────────────────────

function renderInline(text: string): React.ReactNode[] {
    // Handle **bold** spans
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
            return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
        }
        return <span key={i}>{part}</span>
    })
}

function MarkdownText({ text }: { text: string }) {
    if (!text || typeof text !== 'string') return null
    const lines  = text.split("\n")
    const nodes: React.ReactNode[] = []
    let   i      = 0

    while (i < lines.length) {
        const line = lines[i]

        // Blank line — skip
        if (!line.trim()) { i++; continue }

        // Bullet list — collect consecutive items
        if (/^[-*•]\s+/.test(line)) {
            const items: string[] = []
            while (i < lines.length && /^[-*•]\s+/.test(lines[i])) {
                items.push(lines[i].replace(/^[-*•]\s+/, ""))
                i++
            }
            nodes.push(
                <ul key={`ul-${i}`} className="list-disc ml-5 space-y-0.5 my-1.5 text-sm">
                    {items.map((item, j) => <li key={j}>{renderInline(item)}</li>)}
                </ul>
            )
            continue
        }

        // Numbered list — collect consecutive items
        if (/^\d+[.)]\s+/.test(line)) {
            const items: string[] = []
            while (i < lines.length && /^\d+[.)]\s+/.test(lines[i])) {
                items.push(lines[i].replace(/^\d+[.)]\s+/, ""))
                i++
            }
            nodes.push(
                <ol key={`ol-${i}`} className="list-decimal ml-5 space-y-0.5 my-1.5 text-sm">
                    {items.map((item, j) => <li key={j}>{renderInline(item)}</li>)}
                </ol>
            )
            continue
        }

        // Normal paragraph
        nodes.push(
            <p key={`p-${i}`} className="text-sm mb-1.5 last:mb-0">
                {renderInline(line)}
            </p>
        )
        i++
    }

    return <div>{nodes}</div>
}

// ─── Message bubbles ─────────────────────────────────────────────────────────

function UserBubble({ content }: { content: string }) {
    return (
        <div className="flex justify-end">
            <div className="flex items-end gap-2 max-w-[80%]">
                <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-2.5 text-sm">
                    {content}
                </div>
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mb-0.5">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
            </div>
        </div>
    )
}

function AssistantBubble({ content, error }: { content: string; error?: boolean }) {
    return (
        <div className="flex justify-start">
            <div className="flex items-end gap-2 max-w-[85%]">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5 ${
                    error ? "bg-destructive/10" : "bg-primary/10"
                }`}>
                    {error
                        ? <AlertCircle className="w-3.5 h-3.5 text-destructive" />
                        : <Sparkles className="w-3.5 h-3.5 text-primary" />
                    }
                </div>
                <div className={`rounded-2xl rounded-bl-sm px-4 py-2.5 ${
                    error
                        ? "bg-destructive/10 border border-destructive/20 text-destructive-foreground"
                        : "bg-muted text-foreground"
                }`}>
                    <MarkdownText text={content ?? ''} />
                </div>
            </div>
        </div>
    )
}

function TypingIndicator() {
    return (
        <div className="flex justify-start">
            <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
            </div>
        </div>
    )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ChatbotIndex({ context }: Props) {
    const [messages,      setMessages]      = useState<Message[]>([])
    const [input,         setInput]         = useState("")
    const [isLoading,     setIsLoading]     = useState(false)
    const [snapshotTime,  setSnapshotTime]  = useState(context.snapshot_taken_at)

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const textareaRef    = useRef<HTMLTextAreaElement>(null)

    const overdue = (context.risks.overdue ?? 0) + (context.assessments.overdue ?? 0)

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages, isLoading])

    // Auto-resize textarea
    useEffect(() => {
        const ta = textareaRef.current
        if (!ta) return
        ta.style.height = "auto"
        ta.style.height = Math.min(ta.scrollHeight, 120) + "px"
    }, [input])

    const sendMessage = useCallback(async (text: string) => {
        const trimmed = text.trim()
        if (!trimmed || isLoading) return

        const userMsg: Message = { role: "user", content: trimmed }
        const history = messages.map(m => ({ role: m.role, content: m.content }))

        setMessages(prev => [...prev, userMsg])
        setInput("")
        setIsLoading(true)

        try {
            const res = await axios.post("/chatbot/chat", { message: trimmed, history })
            const data = res.data

            setMessages(prev => [
                ...prev,
                { role: "assistant", content: data.reply ?? '', error: data.error === true },
            ])

            if (data.snapshot_taken_at) {
                setSnapshotTime(data.snapshot_taken_at)
            }
        } catch {
            setMessages(prev => [
                ...prev,
                { role: "assistant", content: "Connection error — please check your network and try again.", error: true },
            ])
        } finally {
            setIsLoading(false)
            textareaRef.current?.focus()
        }
    }, [messages, isLoading])

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            sendMessage(input)
        }
    }

    const clearChat = () => {
        setMessages([])
        setInput("")
        textareaRef.current?.focus()
    }

    // Format snapshot timestamp
    const formatTime = (iso: string) => {
        try {
            return new Date(iso).toLocaleString(undefined, {
                month: "short", day: "numeric",
                hour: "2-digit", minute: "2-digit",
            })
        } catch {
            return iso
        }
    }

    const complianceColor =
        context.controls.compliance_percentage >= 80 ? "text-green-500" :
        context.controls.compliance_percentage >= 50 ? "text-yellow-500" : "text-red-500"

    return (
        <AdminLayout>
            <div className="flex flex-col h-[calc(100vh-7rem)] max-w-4xl mx-auto gap-4">

                {/* ── Header ── */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-primary" />
                            <h1 className="text-xl font-semibold tracking-tight">AI Compliance Assistant</h1>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Ask anything about your GRC posture
                        </p>
                    </div>

                    {messages.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearChat}
                            className="flex items-center gap-1.5 flex-shrink-0"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Clear
                        </Button>
                    )}
                </div>

                {/* ── Context summary bar ── */}
                <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 rounded-lg border bg-muted/40 text-sm">
                    <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide mr-1">
                        Live context:
                    </span>
                    <Badge variant="outline" className={`text-xs font-medium ${complianceColor} border-current`}>
                        {context.controls.compliance_percentage}% compliant
                    </Badge>
                    <Badge variant="outline" className="text-xs font-medium text-orange-500 border-orange-500/30">
                        {context.risks.total_open} open risks
                    </Badge>
                    {overdue > 0 && (
                        <Badge variant="outline" className="text-xs font-medium text-red-500 border-red-500/30">
                            {overdue} overdue item{overdue !== 1 ? "s" : ""}
                        </Badge>
                    )}
                </div>

                {/* ── Chat area ── */}
                <Card className="flex-1 overflow-hidden flex flex-col min-h-0">
                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">

                        {/* Empty state — suggestion chips */}
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full gap-6 py-8">
                                <div className="text-center space-y-1">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                                        <Sparkles className="w-6 h-6 text-primary" />
                                    </div>
                                    <p className="text-sm font-medium">How can I help you today?</p>
                                    <p className="text-xs text-muted-foreground">
                                        I have access to your live risk, control, and compliance data.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                                    {SUGGESTIONS.map(s => (
                                        <button
                                            key={s}
                                            onClick={() => sendMessage(s)}
                                            disabled={isLoading}
                                            className="text-left text-sm px-4 py-3 rounded-xl border bg-card hover:bg-accent hover:border-primary/30 transition-colors disabled:opacity-50"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Message history */}
                        {messages.map((msg, idx) =>
                            msg.role === "user"
                                ? <UserBubble      key={idx} content={msg.content} />
                                : <AssistantBubble key={idx} content={msg.content} error={msg.error} />
                        )}

                        {/* Typing indicator */}
                        {isLoading && <TypingIndicator />}

                        <div ref={messagesEndRef} />
                    </CardContent>

                    {/* ── Input area ── */}
                    <div className="border-t p-3 flex gap-2 items-end">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                            rows={1}
                            placeholder="Ask me about your risks, controls, compliance status…"
                            className="flex-1 resize-none bg-transparent text-sm placeholder:text-muted-foreground outline-none px-3 py-2 rounded-lg border focus:border-primary transition-colors disabled:opacity-50 min-h-[40px] max-h-[120px]"
                        />
                        <Button
                            size="icon"
                            onClick={() => sendMessage(input)}
                            disabled={isLoading || !input.trim()}
                            className="flex-shrink-0 h-10 w-10"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </Card>

                {/* ── Snapshot footnote ── */}
                <p className="text-xs text-muted-foreground text-center pb-1">
                    Based on data snapshot taken at {formatTime(snapshotTime)}
                </p>
            </div>
        </AdminLayout>
    )
}
