import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, Plus } from "lucide-react";
import IncidentMaintenanceForm from "./add-incident-form";
import axios from "axios";
import UpdateIncidentMaintenanceForm from "./update-incident-form";

interface IncidentMaintenance {
    _id: string;
    description: string;
    serviceName: string;
    type: "Incident" | "Maintenance";
    status: "Open" | "In Progress" | "Resolved";
    impactOnService:
        | "Operational"
        | "Partial Outage"
        | "Degraded Performance"
        | "Major Outage"
        | "Under Maintenance";
}
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function IncidentMaintenancePage() {
    const [items, setItems] = useState<IncidentMaintenance[]>([]);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<IncidentMaintenance | null>(
        null
    );
    const [description, setDescription] = useState("");
    const [serviceName, setServiceName] = useState("");
    const [type, setType] = useState<"Incident" | "Maintenance">("Incident");
    const [status, setStatus] = useState<"Open" | "In Progress" | "Resolved">(
        "Open"
    );
    const [impact, setImpact] = useState<
        | "Operational"
        | "Partial Outage"
        | "Degraded Performance"
        | "Major Outage"
        | "Under Maintenance"
    >("Operational");

    const fetchIncidents = async () => {
        try {
            const response = await axios(
                `${BACKEND_URL}/api/incidents/incidents`
            ); // Replace with your API endpoint
            const data = response.data;
            setItems(data);
        } catch (error) {
            console.error("Error fetching services:", error);
        }
    };
    useEffect(() => {
        fetchIncidents();
    }, []);

    const handleEdit = (item: IncidentMaintenance) => {
        setCurrentItem(item);
        // setDescription(item.description);
        // setServiceName(item.serviceName);
        // setType(item.type);
        // setStatus(item.status);
        // setImpact(item.impactOnService);
        setIsEditDialogOpen(true);
    };

    const handleDelete = async (_id: string) => {
        await axios.delete(
            `${BACKEND_URL}/api/incidents/deleteIncident/${_id}`
        );
        fetchIncidents();
    };

    const resetForm = () => {
        setCurrentItem(null);
        setDescription("");
        setServiceName("");
        setType("Incident");
        setStatus("Open");
        setImpact("Operational");
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Incidents / Maintenance</h1>
                <Dialog
                    open={isAddDialogOpen}
                    onOpenChange={setIsAddDialogOpen}
                >
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="mr-2 h-4 w-4" /> Log New
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>
                                Log New Incident / Maintenance
                            </DialogTitle>
                        </DialogHeader>
                        <IncidentMaintenanceForm />
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Description</TableHead>
                                <TableHead>Service Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Impact</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item) => (
                                <TableRow key={item._id}>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell>{item.serviceName}</TableCell>
                                    <TableCell>{item.type}</TableCell>
                                    <TableCell>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                                item.status
                                            )}`}
                                        >
                                            {item.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getImpactColor(
                                                item.impactOnService
                                            )}`}
                                        >
                                            {item.impactOnService}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(item)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                handleDelete(item._id)
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Incident / Maintenance</DialogTitle>
                    </DialogHeader>
                    <UpdateIncidentMaintenanceForm item={currentItem} />
                </DialogContent>
            </Dialog>
        </div>
    );
}

function getStatusColor(status: string): string {
    switch (status) {
        case "Open":
            return "bg-yellow-100 text-yellow-800";
        case "In Progress":
            return "bg-blue-100 text-blue-800";
        case "Resolved":
            return "bg-green-100 text-green-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
}

function getImpactColor(impact: string): string {
    switch (impact) {
        case "Operational":
            return "bg-green-100 text-green-800";
        case "Partial Outage":
            return "bg-yellow-100 text-yellow-800";
        case "Degraded Performance":
            return "bg-orange-100 text-orange-800";
        case "Major Outage":
            return "bg-red-100 text-red-800";
        case "Under Maintenance":
            return "bg-blue-100 text-blue-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
}
