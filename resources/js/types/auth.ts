export type Role = 'super_admin' | 'admin' | 'auditor' | 'user';

export const ROLE_LABELS: Record<Role, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    auditor: 'Auditor',
    user: 'User',
};

export type User = {
    id: number;
    name: string;
    email: string;
    role: Role;
    corporation_id: number | null;
    is_corporation_manager?: boolean;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
