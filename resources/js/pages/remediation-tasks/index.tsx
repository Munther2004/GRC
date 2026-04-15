import { Head, router, usePage } from '@inertiajs/react';
import type { SharedProps } from '@/types';
import { route } from '@/lib/routes';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    ClipboardList,
    Plus,
    Search,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Pencil,
    Trash2,
    CheckCheck,
    Calendar,
    User,
    Sparkles,
    X,
} from 'lucide-react';
import { useState } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TaskControl {
    id: number;
    control_id: string;
    title: string;
    framework: string;
}

interface Task {
    id: number;
    title: string;
    description: string | null;
    assigned_to: string | null;
    due_date: string | null;
    priority: 'critical' | 'high' | 'medium' | 'low';
    status: 'open' | 'in_progress' | 'completed' | 'cancelled';
    completion_notes: string | null;
    auto_closed: boolean;
    closed_at: string | null;
    is_overdue: boolean;
    created_at: string;
    control: TaskControl;
    assessment: { id: number; title: string } | null;
    created_by_name: string | null;
}

interface ControlOption {
    id: number;
    control_id: string;
    title: string;
    framework: string;
}

interface AssessmentOption {
    id: number;
    title: string;
}

interface Props {
    tasks: {
        data: Task[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    stats: {
        total: number;
        open_in_progress: number;
        overdue: number;
        completed_this_month: number;
    };
    controls: ControlOption[];
    assessments: AssessmentOption[];
    filters: { search?: string; status?: string; priority?: string };
}

// ── Badge helpers ──────────────────────────────────────────────────────────────

const priorityBadge: Record<string, string> = {
    critical: 'bg-red-100 text-red-700 border-red-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    low: 'bg-blue-100 text-blue-700 border-blue-200',
};

const statusBadge: Record<string, string> = {
    open: 'bg-gray-100 text-gray-600 border-gray-200',
    in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
    completed: 'bg-green-100 text-green-700 border-green-200',
    cancelled: 'bg-red-100 text-red-600 border-red-200',
};

const statusLabel: Record<string, string> = {
    open: 'Open',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
};

// ── Empty form ─────────────────────────────────────────────────────────────────

const emptyForm = {
    control_id: '' as any,
    assessment_id: '' as any,
    title: '',
    description: '',
    assigned_to: '',
    due_date: '',
    priority: 'medium' as Task['priority'],
    status: 'open' as Task['status'],
    completion_notes: '',
};

// ── Task Form (shared for Add + Edit) ─────────────────────────────────────────

function TaskForm({
    form,
    setForm,
    controls,
    assessments,
    isEdit,
}: {
    form: typeof emptyForm;
    setForm: React.Dispatch<React.SetStateAction<typeof emptyForm>>;
    controls: ControlOption[];
    assessments: AssessmentOption[];
    isEdit: boolean;
}) {
    const [controlSearch, setControlSearch] = useState('');
    const [showControlList, setShowControlList] = useState(false);

    const selectedControl = controls.find(
        (c) => c.id === Number(form.control_id),
    );

    const filteredControls = controls.filter(
        (c) =>
            controlSearch === '' ||
            c.control_id.toLowerCase().includes(controlSearch.toLowerCase()) ||
            c.title.toLowerCase().includes(controlSearch.toLowerCase()) ||
            c.framework.toLowerCase().includes(controlSearch.toLowerCase()),
    );

    const showCompletion =
        form.status === 'completed' || form.status === 'cancelled';

    return (
        <div className="space-y-4">
            {/* Control picker — only on add */}
            {!isEdit && (
                <div>
                    <Label className="text-xs font-medium">
                        Control <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative mt-1">
                        <input
                            type="text"
                            placeholder="Search by ID, title or framework..."
                            value={
                                selectedControl
                                    ? `[${selectedControl.framework}] ${selectedControl.control_id} — ${selectedControl.title}`
                                    : controlSearch
                            }
                            onChange={(e) => {
                                setControlSearch(e.target.value);
                                setForm((f) => ({ ...f, control_id: '' }));
                                setShowControlList(true);
                            }}
                            onFocus={() => setShowControlList(true)}
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                        />
                        {showControlList &&
                            !selectedControl &&
                            filteredControls.length > 0 && (
                                <div className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-white shadow-lg dark:bg-gray-900">
                                    {filteredControls.slice(0, 12).map((c) => (
                                        <button
                                            key={c.id}
                                            type="button"
                                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                                            onClick={() => {
                                                setForm((f) => ({
                                                    ...f,
                                                    control_id: c.id,
                                                }));
                                                setControlSearch(
                                                    `[${c.framework}] ${c.control_id} — ${c.title}`,
                                                );
                                                setShowControlList(false);
                                            }}
                                        >
                                            <Badge
                                                variant="outline"
                                                className="shrink-0 font-mono text-xs"
                                            >
                                                {c.control_id}
                                            </Badge>
                                            <span className="truncate">
                                                {c.title}
                                            </span>
                                            <Badge
                                                variant="secondary"
                                                className="ml-auto shrink-0 text-xs"
                                            >
                                                {c.framework}
                                            </Badge>
                                        </button>
                                    ))}
                                </div>
                            )}
                    </div>
                </div>
            )}

            {/* Title */}
            <div>
                <Label className="text-xs font-medium">
                    Title <span className="text-red-500">*</span>
                </Label>
                <Input
                    className="mt-1"
                    value={form.title}
                    onChange={(e) =>
                        setForm((f) => ({ ...f, title: e.target.value }))
                    }
                    placeholder="Short descriptive task title"
                />
            </div>

            {/* Description */}
            <div>
                <Label className="text-xs font-medium">Description</Label>
                <Textarea
                    className="mt-1 resize-none"
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                        setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    placeholder="Detailed steps or context..."
                />
            </div>

            {/* Row: Assigned To + Due Date */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label className="text-xs font-medium">Assigned To</Label>
                    <Input
                        className="mt-1"
                        value={form.assigned_to}
                        onChange={(e) =>
                            setForm((f) => ({
                                ...f,
                                assigned_to: e.target.value,
                            }))
                        }
                        placeholder="Name or email"
                    />
                </div>
                <div>
                    <Label className="text-xs font-medium">Due Date</Label>
                    <Input
                        type="date"
                        className="mt-1"
                        value={form.due_date}
                        onChange={(e) =>
                            setForm((f) => ({ ...f, due_date: e.target.value }))
                        }
                    />
                </div>
            </div>

            {/* Row: Priority + Status */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Label className="text-xs font-medium">Priority</Label>
                    <Select
                        value={form.priority}
                        onValueChange={(v) =>
                            setForm((f) => ({ ...f, priority: v as any }))
                        }
                    >
                        <SelectTrigger className="mt-1">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label className="text-xs font-medium">Status</Label>
                    <Select
                        value={form.status}
                        onValueChange={(v) =>
                            setForm((f) => ({ ...f, status: v as any }))
                        }
                    >
                        <SelectTrigger className="mt-1">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">
                                In Progress
                            </SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Assessment (optional) — only on add */}
            {!isEdit && (
                <div>
                    <Label className="text-xs font-medium">
                        Assessment (optional)
                    </Label>
                    <Select
                        value={
                            form.assessment_id
                                ? String(form.assessment_id)
                                : 'none'
                        }
                        onValueChange={(v) =>
                            setForm((f) => ({
                                ...f,
                                assessment_id: v === 'none' ? '' : Number(v),
                            }))
                        }
                    >
                        <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Link to an assessment..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {assessments.map((a) => (
                                <SelectItem key={a.id} value={String(a.id)}>
                                    {a.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Completion notes — only if completed or cancelled */}
            {showCompletion && (
                <div>
                    <Label className="text-xs font-medium">
                        Completion Notes
                    </Label>
                    <Textarea
                        className="mt-1 resize-none"
                        rows={2}
                        value={form.completion_notes}
                        onChange={(e) =>
                            setForm((f) => ({
                                ...f,
                                completion_notes: e.target.value,
                            }))
                        }
                        placeholder="What was done / reason for cancellation..."
                    />
                </div>
            )}
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function RemediationTasksIndex({
    tasks,
    stats,
    controls,
    assessments,
    filters,
}: Props) {
    const { auth } = usePage<SharedProps>().props;
    const canEdit = auth.user.role === 'admin' || auth.user.role === 'user';

    // Filter state
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? 'all');
    const [priority, setPriority] = useState(filters.priority ?? 'all');

    // Modal state
    const [addOpen, setAddOpen] = useState(false);
    const [editTask, setEditTask] = useState<Task | null>(null);
    const [deleteTask, setDeleteTask] = useState<Task | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Form state
    const [form, setForm] = useState({ ...emptyForm });

    // Flash
    const { flash } = usePage<SharedProps>().props;

    const applyFilters = (
        overrides: { status?: string; priority?: string } = {},
    ) => {
        const resolvedStatus = overrides.status ?? status;
        const resolvedPriority = overrides.priority ?? priority;
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (resolvedStatus !== 'all') params.status = resolvedStatus;
        if (resolvedPriority !== 'all') params.priority = resolvedPriority;
        router.get(route('remediation-tasks.index'), params, {
            preserveState: true,
            replace: true,
        });
    };

    const openAdd = () => {
        setForm({ ...emptyForm });
        setAddOpen(true);
    };

    const openEdit = (t: Task) => {
        setForm({
            control_id: t.control.id,
            assessment_id: t.assessment?.id ?? '',
            title: t.title,
            description: t.description ?? '',
            assigned_to: t.assigned_to ?? '',
            due_date: t.due_date ?? '',
            priority: t.priority,
            status: t.status,
            completion_notes: t.completion_notes ?? '',
        });
        setEditTask(t);
    };

    const submitAdd = () => {
        if (!form.control_id || !form.title || !form.priority || !form.status)
            return;
        setSaving(true);
        router.post(
            route('remediation-tasks.store'),
            {
                control_id: form.control_id,
                assessment_id: form.assessment_id || null,
                title: form.title,
                description: form.description || null,
                assigned_to: form.assigned_to || null,
                due_date: form.due_date || null,
                priority: form.priority,
                status: form.status,
                completion_notes: form.completion_notes || null,
            },
            {
                onSuccess: () => {
                    setAddOpen(false);
                    setSaving(false);
                },
                onError: () => setSaving(false),
            },
        );
    };

    const submitEdit = () => {
        if (!editTask) return;
        setSaving(true);
        router.put(
            route('remediation-tasks.update', editTask.id),
            {
                title: form.title,
                description: form.description || null,
                assigned_to: form.assigned_to || null,
                due_date: form.due_date || null,
                priority: form.priority,
                status: form.status,
                completion_notes: form.completion_notes || null,
            },
            {
                onSuccess: () => {
                    setEditTask(null);
                    setSaving(false);
                },
                onError: () => setSaving(false),
            },
        );
    };

    const confirmDelete = () => {
        if (!deleteTask) return;
        setDeleting(true);
        router.delete(route('remediation-tasks.destroy', deleteTask.id), {
            onSuccess: () => {
                setDeleteTask(null);
                setDeleting(false);
            },
            onError: () => setDeleting(false),
        });
    };

    const markComplete = (t: Task) => {
        if (!confirm(`Mark "${t.title}" as completed?`)) return;
        router.post(route('remediation-tasks.complete', t.id));
    };

    return (
        <AdminLayout>
            <Head title="Remediation Tasks" />

            <div className="space-y-6">
                {/* ── Header ── */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
                            <ClipboardList className="h-6 w-6 text-indigo-600" />
                            Remediation Tasks
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Track and manage compliance remediation work linked
                            to controls
                        </p>
                    </div>
                    {canEdit && (
                        <Button
                            className="gap-2 bg-indigo-600 text-white hover:bg-indigo-700"
                            onClick={openAdd}
                        >
                            <Plus className="h-4 w-4" /> Add Task
                        </Button>
                    )}
                </div>

                {/* Flash */}
                {flash?.success && (
                    <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        {flash.success}
                    </div>
                )}

                {/* ── KPI Cards ── */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                                {stats.total}
                            </p>
                            <p className="mt-0.5 text-xs text-gray-500">
                                Total Tasks
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-2xl font-bold text-blue-600">
                                {stats.open_in_progress}
                            </p>
                            <p className="mt-0.5 text-xs text-gray-500">
                                Open / In Progress
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p
                                className={`text-2xl font-bold ${stats.overdue > 0 ? 'text-red-600' : 'text-green-600'}`}
                            >
                                {stats.overdue}
                            </p>
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                                {stats.overdue > 0 && (
                                    <AlertTriangle className="h-3 w-3 text-red-500" />
                                )}
                                Overdue
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-2xl font-bold text-green-600">
                                {stats.completed_this_month}
                            </p>
                            <p className="mt-0.5 text-xs text-gray-500">
                                Completed This Month
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Filters ── */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative min-w-[220px] flex-1">
                        <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search title or control ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === 'Enter' && applyFilters()
                            }
                            className="pl-9"
                        />
                    </div>

                    <Select
                        value={status}
                        onValueChange={(v) => {
                            setStatus(v);
                            applyFilters({ status: v });
                        }}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">
                                In Progress
                            </SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={priority}
                        onValueChange={(v) => {
                            setPriority(v);
                            applyFilters({ priority: v });
                        }}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Priorities</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="outline" onClick={() => applyFilters()}>
                        Filter
                    </Button>

                    {(search || status !== 'all' || priority !== 'all') && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-gray-500"
                            onClick={() => {
                                setSearch('');
                                setStatus('all');
                                setPriority('all');
                                router.get(route('remediation-tasks.index'));
                            }}
                        >
                            <X className="h-3.5 w-3.5" /> Clear
                        </Button>
                    )}
                </div>

                {/* ── Task Table ── */}
                <Card>
                    <CardContent className="p-0">
                        {tasks.data.length === 0 ? (
                            <div className="py-16 text-center text-gray-400">
                                <ClipboardList className="mx-auto mb-3 h-12 w-12 opacity-30" />
                                <p className="text-lg font-medium">
                                    No remediation tasks yet
                                </p>
                                <p className="mt-1 text-sm">
                                    Add a task to start tracking remediation
                                    work.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                                        <tr>
                                            {[
                                                'Priority',
                                                'Title',
                                                'Control',
                                                'Framework',
                                                'Assigned To',
                                                'Due Date',
                                                'Status',
                                                'Actions',
                                            ].map((h) => (
                                                <th
                                                    key={h}
                                                    className="px-4 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase"
                                                >
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {tasks.data.map((task) => (
                                            <tr
                                                key={task.id}
                                                className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${task.is_overdue ? 'bg-red-50/40 dark:bg-red-950/20' : ''}`}
                                            >
                                                {/* Priority */}
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        className={`border text-xs capitalize ${priorityBadge[task.priority]}`}
                                                    >
                                                        {task.priority}
                                                    </Badge>
                                                </td>

                                                {/* Title */}
                                                <td className="max-w-[220px] px-4 py-3">
                                                    <p className="truncate font-medium text-gray-900 dark:text-white">
                                                        {task.title}
                                                    </p>
                                                    {task.auto_closed && (
                                                        <span className="mt-0.5 inline-flex items-center gap-1 text-xs text-purple-600">
                                                            <Sparkles className="h-3 w-3" />{' '}
                                                            Auto-closed
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Control */}
                                                <td className="max-w-[200px] px-4 py-3">
                                                    <span className="font-mono text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                        {
                                                            task.control
                                                                .control_id
                                                        }
                                                    </span>
                                                    <p className="mt-0.5 truncate text-xs text-gray-500">
                                                        {task.control.title}
                                                    </p>
                                                </td>

                                                {/* Framework */}
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-xs"
                                                    >
                                                        {task.control.framework}
                                                    </Badge>
                                                </td>

                                                {/* Assigned To */}
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                                    {task.assigned_to ? (
                                                        <span className="flex items-center gap-1 text-xs">
                                                            <User className="h-3 w-3 shrink-0" />
                                                            {task.assigned_to}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">
                                                            —
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Due Date */}
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {task.due_date ? (
                                                        <span
                                                            className={`flex items-center gap-1 text-xs ${task.is_overdue ? 'font-semibold text-red-600' : 'text-gray-600 dark:text-gray-400'}`}
                                                        >
                                                            <Calendar className="h-3 w-3 shrink-0" />
                                                            {new Date(
                                                                task.due_date,
                                                            ).toLocaleDateString()}
                                                            {task.is_overdue && (
                                                                <span className="ml-1 text-red-600">
                                                                    (Overdue)
                                                                </span>
                                                            )}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">
                                                            —
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Status */}
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        className={`border text-xs capitalize ${statusBadge[task.status]}`}
                                                    >
                                                        {
                                                            statusLabel[
                                                                task.status
                                                            ]
                                                        }
                                                    </Badge>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-4 py-3">
                                                    {canEdit && (
                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-7 w-7 p-0 text-gray-500 hover:text-indigo-600"
                                                                onClick={() =>
                                                                    openEdit(
                                                                        task,
                                                                    )
                                                                }
                                                                title="Edit"
                                                            >
                                                                <Pencil className="h-3.5 w-3.5" />
                                                            </Button>

                                                            {![
                                                                'completed',
                                                                'cancelled',
                                                            ].includes(
                                                                task.status,
                                                            ) && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-7 w-7 p-0 text-gray-500 hover:text-green-600"
                                                                    onClick={() =>
                                                                        markComplete(
                                                                            task,
                                                                        )
                                                                    }
                                                                    title="Mark Complete"
                                                                >
                                                                    <CheckCheck className="h-3.5 w-3.5" />
                                                                </Button>
                                                            )}

                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-7 w-7 p-0 text-gray-500 hover:text-red-600"
                                                                onClick={() =>
                                                                    setDeleteTask(
                                                                        task,
                                                                    )
                                                                }
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ── Pagination ── */}
                {tasks.links.length > 3 && (
                    <div className="flex items-center justify-center gap-1">
                        {tasks.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${link.active ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'} ${!link.url ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Add Task Dialog ── */}
            <Dialog
                open={addOpen}
                onOpenChange={(open) => !saving && setAddOpen(open)}
            >
                <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Plus className="h-4 w-4" /> New Remediation Task
                        </DialogTitle>
                    </DialogHeader>

                    <TaskForm
                        form={form}
                        setForm={setForm}
                        controls={controls}
                        assessments={assessments}
                        isEdit={false}
                    />

                    <DialogFooter className="mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setAddOpen(false)}
                            disabled={saving}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={submitAdd}
                            disabled={saving || !form.control_id || !form.title}
                            className="bg-indigo-600 text-white hover:bg-indigo-700"
                        >
                            {saving ? 'Saving…' : 'Create Task'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Edit Task Dialog ── */}
            <Dialog
                open={!!editTask}
                onOpenChange={(open) => !saving && !open && setEditTask(null)}
            >
                <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Pencil className="h-4 w-4" /> Edit Task
                        </DialogTitle>
                        {editTask && (
                            <p className="mt-1 text-sm text-gray-500">
                                <span className="font-mono font-semibold">
                                    {editTask.control.control_id}
                                </span>{' '}
                                — {editTask.control.title}
                            </p>
                        )}
                    </DialogHeader>

                    <TaskForm
                        form={form}
                        setForm={setForm}
                        controls={controls}
                        assessments={assessments}
                        isEdit={true}
                    />

                    <DialogFooter className="mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setEditTask(null)}
                            disabled={saving}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={submitEdit}
                            disabled={saving || !form.title}
                            className="bg-indigo-600 text-white hover:bg-indigo-700"
                        >
                            {saving ? 'Saving…' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Delete Confirm Dialog ── */}
            <Dialog
                open={!!deleteTask}
                onOpenChange={(open) =>
                    !deleting && !open && setDeleteTask(null)
                }
            >
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <Trash2 className="h-4 w-4" /> Delete Task
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        Delete <strong>"{deleteTask?.title}"</strong>? This
                        cannot be undone.
                    </p>
                    <DialogFooter className="mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteTask(null)}
                            disabled={deleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={deleting}
                        >
                            {deleting ? 'Deleting…' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
