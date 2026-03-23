import { Head, Link, router, usePage } from '@inertiajs/react';
import { route } from '@/lib/routes';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Pencil, Trash2, AlertTriangle, User, Calendar, Tag, Shield, Link2, Unlink, Plus, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface Risk {
    id: number; title: string; description: string; category: string;
    owner: string; likelihood: number; impact: number; risk_score: number;
    risk_level: string; status: string; treatment: string; treatment_plan: string | null;
    due_date: string | null; created_at: string; user: { name: string };
    auto_generated: number;
    ai_validated: boolean;
    source_control: { control_id: string; title: string } | null;
}

interface LinkedControl {
    id: number;
    control_id: string;
    title: string;
    description: string;
    implementation_guidance: string | null;
    category: string;
    auto_linked: boolean;
    link_type: string;
    link_reason: string | null;
    framework: string;
}

interface AllControl {
    id: number;
    control_id: string;
    title: string;
    framework: string;
}

interface Props {
    risk: Risk;
    linkedControls: LinkedControl[];
    allControls: AllControl[];
}

const levelColors: Record<string, string> = {
    critical: 'text-red-500 bg-red-50 border-red-200',
    high:     'text-orange-500 bg-orange-50 border-orange-200',
    medium:   'text-yellow-600 bg-yellow-50 border-yellow-200',
    low:      'text-green-600 bg-green-50 border-green-200',
};

const ScoreCell = ({ value, active, color }: { value: number; active: boolean; color: string }) => (
    <div className={`w-10 h-10 flex items-center justify-center rounded text-xs font-bold border
        ${active ? color : 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-200'}`}>
        {value}
    </div>
);

export default function RiskShow({ risk, linkedControls, allControls }: Props) {
    const { auth } = usePage().props as any;
    const isAdmin  = auth.user.role === 'admin';
    const canEdit  = auth.user.role === 'admin' || auth.user.role === 'user';

    const [selectedControlId, setSelectedControlId] = useState<number | ''>('');
    const [controlSearch, setControlSearch] = useState('');

    const deleteRisk = () => {
        if (!confirm(`Delete "${risk.title}"? This cannot be undone.`)) return;
        router.delete(route('risks.destroy', risk.id));
    };

    const linkControl = () => {
        if (!selectedControlId) return;
        router.post(route('risks.link-control', risk.id), { control_id: selectedControlId }, {
            onSuccess: () => { setSelectedControlId(''); setControlSearch(''); },
        });
    };

    const unlinkControl = (controlId: number) => {
        if (!confirm('Unlink this control?')) return;
        router.post(route('risks.unlink-control', risk.id), { control_id: controlId });
    };

    const filteredControls = allControls.filter(c =>
        !linkedControls.some(lc => lc.id === c.id) &&
        (controlSearch === '' ||
            c.control_id.toLowerCase().includes(controlSearch.toLowerCase()) ||
            c.title.toLowerCase().includes(controlSearch.toLowerCase()) ||
            c.framework.toLowerCase().includes(controlSearch.toLowerCase()))
    );

    const score = risk.likelihood * risk.impact;
    const levelColor = levelColors[risk.risk_level];

    return (
        <AdminLayout>
            <Head title={risk.title} />

            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                        <Link href={route('risks.index')}>
                            <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{risk.title}</h1>
                            <p className="text-sm text-gray-500 mt-1">Created by {risk.user?.name} · {new Date(risk.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {canEdit && (
                            <Link href={route('risks.edit', risk.id)}>
                                <Button variant="outline" className="gap-2"><Pencil className="w-4 h-4" /> Edit</Button>
                            </Link>
                        )}
                        {isAdmin && (
                            <Button variant="outline" className="gap-2 text-red-500 hover:bg-red-50 border-red-200" onClick={deleteRisk}>
                                <Trash2 className="w-4 h-4" /> Delete
                            </Button>
                        )}
                    </div>
                </div>

                {/* AI-generated banner */}
                {risk.auto_generated === 1 && risk.source_control && (
                    <div className="flex items-start gap-3 p-4 rounded-lg border border-purple-200 bg-purple-50">
                        <Sparkles className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-purple-800">This risk was automatically generated by AI</p>
                            <p className="text-xs text-purple-600 mt-0.5">
                                From non-compliant control: <span className="font-mono font-semibold">{risk.source_control.control_id}</span> — {risk.source_control.title}
                            </p>
                        </div>
                    </div>
                )}

                {/* AI Validated banner */}
                {risk.ai_validated && (
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-blue-200 bg-blue-50">
                        <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                        <p className="text-sm font-medium text-blue-800">Risk scores have been validated by AI</p>
                        <Badge className="ml-auto bg-blue-100 text-blue-700 border-blue-200 text-xs shrink-0">
                            <Sparkles className="w-3 h-3 mr-1" />AI Validated
                        </Badge>
                    </div>
                )}

                <div className="grid grid-cols-3 gap-6">

                    {/* Left column */}
                    <div className="col-span-2 space-y-6">
                        <Card>
                            <CardHeader><CardTitle className="text-base">Description</CardTitle></CardHeader>
                            <CardContent>
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{risk.description}</p>
                            </CardContent>
                        </Card>

                        {risk.treatment_plan && (
                            <Card>
                                <CardHeader><CardTitle className="text-base">Treatment Plan</CardTitle></CardHeader>
                                <CardContent>
                                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{risk.treatment_plan}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Risk Matrix */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Risk Matrix — ISO/IEC 27005</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex gap-1 items-center">
                                        <span className="text-xs text-gray-400 w-20 text-right pr-2">Impact →</span>
                                        {[1,2,3,4,5].map(i => (
                                            <div key={i} className="w-10 text-center text-xs text-gray-400">{i}</div>
                                        ))}
                                    </div>
                                    {[5,4,3,2,1].map(l => (
                                        <div key={l} className="flex gap-1 items-center">
                                            <span className="text-xs text-gray-400 w-20 text-right pr-2">L={l}</span>
                                            {[1,2,3,4,5].map(i => {
                                                const s = l * i;
                                                const isActive = l === risk.likelihood && i === risk.impact;
                                                const c = s >= 20 ? 'bg-red-500 text-white border-red-600'
                                                        : s >= 13 ? 'bg-orange-400 text-white border-orange-500'
                                                        : s >= 7  ? 'bg-yellow-400 text-gray-800 border-yellow-500'
                                                        : 'bg-green-400 text-white border-green-500';
                                                return <ScoreCell key={i} value={s} active={isActive} color={c} />;
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right column */}
                    <div className="space-y-4">
                        <Card>
                            <CardContent className={`p-4 rounded-lg border mt-4 ${levelColor}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="w-5 h-5" />
                                    <span className="font-semibold capitalize">{risk.risk_level} Risk</span>
                                </div>
                                <div className="text-4xl font-bold">{score}<span className="text-lg font-normal"> / 25</span></div>
                                <p className="text-xs mt-1">{risk.likelihood} (likelihood) × {risk.impact} (impact)</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4 space-y-3">
                                {[
                                    { icon: Tag,      label: 'Category',  value: risk.category },
                                    { icon: User,     label: 'Owner',     value: risk.owner },
                                    { icon: Shield,   label: 'Treatment', value: risk.treatment },
                                    { icon: Calendar, label: 'Due Date',  value: risk.due_date ? new Date(risk.due_date).toLocaleDateString() : 'Not set' },
                                ].map(({ icon: Icon, label, value }) => (
                                    <div key={label} className="flex items-start gap-3">
                                        <Icon className="w-4 h-4 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-gray-400">{label}</p>
                                            <p className="text-sm font-medium capitalize">{value}</p>
                                        </div>
                                    </div>
                                ))}
                                <div className="pt-2 border-t">
                                    <p className="text-xs text-gray-400 mb-1">Status</p>
                                    <Badge variant="outline" className="capitalize">
                                        {risk.status.replace('_', ' ')}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Linked Controls */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Link2 className="w-4 h-4" />
                            Linked Controls
                            <Badge variant="secondary" className="ml-1">{linkedControls.length}</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {linkedControls.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No controls linked to this risk.</p>
                        ) : (
                            <div>
                                <p className="text-xs text-gray-400 italic mb-3">Follow these controls to achieve compliance</p>
                                <div className="rounded-md border divide-y divide-border">
                                    {linkedControls.map(ctrl => (
                                        <div key={ctrl.id} className="px-4 py-3">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Badge variant="outline" className="font-mono text-xs shrink-0">{ctrl.control_id}</Badge>
                                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{ctrl.title}</span>
                                                    <Badge variant="secondary" className="text-xs shrink-0">{ctrl.framework}</Badge>
                                                    {ctrl.link_type === 'ai' ? (
                                                        <Badge className="text-xs shrink-0 bg-purple-100 text-purple-700 border-purple-200">
                                                            <Sparkles className="w-2.5 h-2.5 mr-0.5" />AI
                                                        </Badge>
                                                    ) : ctrl.link_type === 'manual' ? (
                                                        <Badge variant="outline" className="text-xs shrink-0 text-purple-600 border-purple-200 bg-purple-50">
                                                            Manual
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-xs shrink-0 text-gray-500 border-gray-200 bg-gray-50">
                                                            Auto
                                                        </Badge>
                                                    )}
                                                </div>
                                                {isAdmin && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 px-2 text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0"
                                                        onClick={() => unlinkControl(ctrl.id)}
                                                    >
                                                        <Unlink className="w-3.5 h-3.5 mr-1" /> Unlink
                                                    </Button>
                                                )}
                                            </div>
                                            {ctrl.implementation_guidance && (
                                                <div className="mt-2 pl-1">
                                                    <p className="text-xs text-gray-400 font-medium mb-0.5">Implementation Guidance:</p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{ctrl.implementation_guidance}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {isAdmin && (
                            <div className="pt-2 border-t space-y-2">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Add Control</p>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Search by ID, title or framework..."
                                        value={controlSearch}
                                        onChange={e => setControlSearch(e.target.value)}
                                        className="flex-1 text-sm border rounded-md px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>
                                {controlSearch && filteredControls.length > 0 && (
                                    <div className="border rounded-md divide-y max-h-48 overflow-y-auto">
                                        {filteredControls.slice(0, 10).map(c => (
                                            <button
                                                key={c.id}
                                                className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2"
                                                onClick={() => { setSelectedControlId(c.id); setControlSearch(`[${c.framework}] ${c.control_id} — ${c.title}`); }}
                                            >
                                                <Badge variant="outline" className="font-mono text-xs shrink-0">{c.control_id}</Badge>
                                                <span className="truncate">{c.title}</span>
                                                <Badge variant="secondary" className="text-xs shrink-0 ml-auto">{c.framework}</Badge>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {controlSearch && filteredControls.length === 0 && (
                                    <p className="text-xs text-muted-foreground px-1">No matching controls found.</p>
                                )}
                                <Button
                                    size="sm"
                                    disabled={!selectedControlId}
                                    onClick={linkControl}
                                    className="gap-1"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Link Control
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}