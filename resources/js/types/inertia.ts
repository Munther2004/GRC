import type { Auth } from './auth';

export interface FlashProps {
    success: string | null;
    error: string | null;
}

export type FileReputationStatus =
    | 'clean'
    | 'suspicious'
    | 'malicious'
    | 'unknown'
    | 'not_found'
    | 'error'
    | 'pending';

export type FileIntegrityStatus =
    | 'verified'
    | 'tampered'
    | 'unknown'
    | 'error'
    | null;

export interface FileReputationCheck {
    id: number;
    status: FileReputationStatus;
    integrity_status: FileIntegrityStatus;
    malicious_count: number;
    suspicious_count: number;
    undetected_count: number;
    harmless_count: number;
    timeout_count: number;
    sha256: string | null;
    upload_sha256: string | null;
    last_analysis_date: string | null;
    provider: string;
    checked_at: string | null;
}

export interface NotificationItem {
    id: number;
    type: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

export interface NotificationsProps {
    unread_count: number;
    recent: NotificationItem[];
    pending_approvals_count: number;
    open_remediation_tasks: number;
}

/** Shared props injected by HandleInertiaRequests for every page. */
export interface SharedProps {
    auth: Auth;
    flash: FlashProps;
    notifications: NotificationsProps;
    [key: string]: unknown;
}
