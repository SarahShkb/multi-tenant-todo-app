import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { switchTenant } from "../api/auth";
import { Button } from "../components/ui/button";
import ManageMembersModal from "./ManageMembersModal";

export default function Navbar() {

    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { activeTenant, tenants, switchTenant: storeSwitchTenant, logout } = useAuthStore();

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showManageModal, setShowManageModal] = useState(false);
    const [switching, setSwitching] = useState<string | null>(null);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const isAdmin = activeTenant?.role === "admin";

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    async function handleSwitch(tenantId: string) {
        if (tenantId === activeTenant?.id) {
            setDropdownOpen(false);
            return;
        }

        setSwitching(tenantId);

        try {
            const result = await switchTenant({ tenantId });
            const newTenant = tenants.find((t) => t.id === tenantId)!;
            storeSwitchTenant(result.accessToken, newTenant);
            queryClient.clear();
            setDropdownOpen(false);
            window.location.reload();
        } catch {
            alert("Failed to switch workspace.");
        } finally {
            setSwitching(null);
        }
    }

    function handleLogout() {
        logout();
        navigate("/login");
    }

    const otherTenants = tenants.filter((t) => t.id !== activeTenant?.id);

    return (
        <>
            <nav className="flex items-center justify-between border-b bg-background px-6 py-4">

                {/* Workspace switcher */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen((prev) => !prev)}
                        className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted transition-colors"
                    >
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
                            {activeTenant?.name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <div>
                            <p className="text-sm font-semibold leading-none">{activeTenant?.name ?? "No workspace"}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 capitalize">{activeTenant?.role}</p>
                        </div>
                        <svg className={`ml-1 h-4 w-4 text-muted-foreground transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {dropdownOpen && (
                        <div className="absolute left-0 top-full mt-1 w-64 rounded-md border bg-background shadow-lg z-50">

                            {/* Current workspace */}
                            <div className="px-3 pt-3 pb-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                    Current workspace
                                </p>
                                <div className="flex items-center gap-2 rounded-md px-2 py-1.5 bg-muted">
                                    <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground text-xs font-bold">
                                        {activeTenant?.name?.[0]?.toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium">{activeTenant?.name}</span>
                                    <svg className="ml-auto h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>

                            {/* Other workspaces */}
                            {otherTenants.length > 0 && (
                                <div className="px-3 pt-2 pb-1">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                        Switch to
                                    </p>
                                    {otherTenants.map((tenant) => (
                                        <button
                                            key={tenant.id}
                                            onClick={() => handleSwitch(tenant.id)}
                                            disabled={switching === tenant.id}
                                            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted transition-colors disabled:opacity-50"
                                        >
                                            <div className="flex h-6 w-6 items-center justify-center rounded bg-secondary text-secondary-foreground text-xs font-bold">
                                                {tenant.name[0].toUpperCase()}
                                            </div>
                                            <span>{tenant.name}</span>
                                            {switching === tenant.id && (
                                                <span className="ml-auto text-xs text-muted-foreground">Switching...</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Manage members — admins only */}
                            {isAdmin && (
                                <>
                                    <div className="border-t mx-3 my-1" />
                                    <div className="px-3 pb-3">
                                        <button
                                            onClick={() => {
                                                setDropdownOpen(false);
                                                setShowManageModal(true);
                                            }}
                                            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted transition-colors text-muted-foreground"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Manage members
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <Button variant="destructive" onClick={handleLogout}>
                    Logout
                </Button>
            </nav>

            <ManageMembersModal
                open={showManageModal}
                onClose={() => setShowManageModal(false)}
            />
        </>
    );
}
