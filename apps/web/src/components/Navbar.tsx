import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function Navbar() {

    const navigate = useNavigate();

    const tenantName = useAuthStore((state) => state.getTenantName());

    const logout = useAuthStore((state) => state.logout);

    function handleLogout() {

        logout();

        navigate("/login");

    }

    return (

        <nav className="flex items-center justify-between border-b p-4">

            <h2 className="text-xl font-bold">

                Tenant: {tenantName || "None"}

            </h2>

            <button
                onClick={handleLogout}
                className="rounded bg-red-500 px-4 py-2 text-white"
            >

                Logout

            </button>

        </nav>

    );

}