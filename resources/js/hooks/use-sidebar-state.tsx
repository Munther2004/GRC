/**
 * Sidebar state — desktop collapsed/open + mobile drawer open/closed.
 *
 * Implemented with React Context so updates propagate reliably across
 * AdminLayout, AdminHeader, and AdminSidebar without HMR/StrictMode quirks.
 *
 * Desktop: persisted to localStorage["grc-sidebar-collapsed"].
 * Mobile : ephemeral, never persisted.
 */
import { createContext, useCallback, useContext, useEffect, useState  } from 'react';
import type {ReactNode} from 'react';

const STORAGE_KEY = 'grc-sidebar-collapsed';

type SidebarCtx = {
    collapsed: boolean;
    setCollapsed: (next: boolean | ((prev: boolean) => boolean)) => void;
    drawerOpen: boolean;
    setDrawerOpen: (next: boolean | ((prev: boolean) => boolean)) => void;
};

const Ctx = createContext<SidebarCtx | null>(null);

function readInitialCollapsed(): boolean {
    if (typeof localStorage === 'undefined') return false;
    try {
        return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
        return false;
    }
}

export function SidebarStateProvider({ children }: { children: ReactNode }) {
    const [collapsed, _setCollapsed] = useState<boolean>(readInitialCollapsed);
    const [drawerOpen, _setDrawerOpen] = useState<boolean>(false);

    const setCollapsed = useCallback((next: boolean | ((prev: boolean) => boolean)) => {
        _setCollapsed((prev) => {
            const value = typeof next === 'function' ? (next as (p: boolean) => boolean)(prev) : next;
            try {
                localStorage.setItem(STORAGE_KEY, value ? '1' : '0');
            } catch {
                /* ignore */
            }
            if (typeof document !== 'undefined') {
                document.documentElement.setAttribute('data-sidebar-collapsed', value ? '1' : '0');
            }
            return value;
        });
    }, []);

    const setDrawerOpen = useCallback((next: boolean | ((prev: boolean) => boolean)) => {
        _setDrawerOpen((prev) => (typeof next === 'function' ? (next as (p: boolean) => boolean)(prev) : next));
    }, []);

    // Mirror collapsed state to <html> so plain CSS could react if needed.
    useEffect(() => {
        if (typeof document === 'undefined') return;
        document.documentElement.setAttribute('data-sidebar-collapsed', collapsed ? '1' : '0');
    }, [collapsed]);

    return (
        <Ctx.Provider value={{ collapsed, setCollapsed, drawerOpen, setDrawerOpen }}>
            {children}
        </Ctx.Provider>
    );
}

function useCtx(): SidebarCtx {
    const value = useContext(Ctx);
    if (!value) {
        // Defensive default — components rendered outside of AdminLayout get a no-op state.
        return {
            collapsed: false,
            setCollapsed: () => {},
            drawerOpen: false,
            setDrawerOpen: () => {},
        };
    }
    return value;
}

export function useSidebarCollapsed(): [boolean, SidebarCtx['setCollapsed']] {
    const { collapsed, setCollapsed } = useCtx();
    return [collapsed, setCollapsed];
}

export function useSidebarDrawer(): [boolean, SidebarCtx['setDrawerOpen']] {
    const { drawerOpen, setDrawerOpen } = useCtx();
    return [drawerOpen, setDrawerOpen];
}
