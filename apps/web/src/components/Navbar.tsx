import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "../components/ui/navigation-menu";

export default function Navbar() {

    const navigate = useNavigate();

    const tenantName = useAuthStore((state) => state.getTenantName());

    const logout = useAuthStore((state) => state.logout);

    function handleLogout() {

        logout();

        navigate("/login");

    }

    return (

        <nav className="flex items-center justify-between border-b bg-background px-6 py-4">
            
            {/* Left: Branding / Tenant Info */}
            <div className="flex items-center gap-8">
                <h2 className="text-xl font-semibold tracking-tight ">
                Tenant: <span className="text-muted-foreground">{tenantName || "None"}</span>
                </h2>
            </div>

            {/* Right: Actions */}
            <Button 
                variant="destructive" 
                onClick={handleLogout}
            >
                Logout
            </Button>
            
            </nav>

    );

}