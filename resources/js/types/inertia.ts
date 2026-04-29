import type { Auth } from './auth';

export interface FlashProps {
    success: string | null;
    error: string | null;
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
