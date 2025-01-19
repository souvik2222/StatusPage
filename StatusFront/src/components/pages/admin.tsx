import { useEffect } from "react";
import IncidentMaintenancePage from "../incidents";
import TeamMembersPage from "../members";
import ServicesPage from "../services";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

const Admin = () => {
    const navigate = useNavigate();
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
        }
    }, [navigate]);
    return (
        <div>
            <h1 onClick={() => {
                    navigate("/");
                }}
                className="text-3xl font-bold font-serif border-dashed border-b">
                    AlgoStatus
            </h1>
            <IncidentMaintenancePage />
            <ServicesPage />
            <TeamMembersPage />
            <Button
                onClick={() => {
                    localStorage.removeItem("token");
                    navigate("/login");
                }}
                className="w-full"
                variant={"destructive"}
            >
                Logout
            </Button>
        </div>
    );
};

export default Admin;
