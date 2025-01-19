import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import ServiceForm from "./add-service-form";
import axios from "axios";
import { set } from "react-hook-form";

interface Service {
    _id: string;
    name: string;
    description: string;
    status: "Operational" | "Degraded" | "Outage";
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [currentService, setCurrentService] = useState<Service | null>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [currentId, setCurrentId] = useState("");
    const [status, setStatus] = useState<"Operational" | "Degraded" | "Outage">(
        "Operational"
    );
    const fetchServices = async () => {
        try {
            const response = await axios(
                `${BACKEND_URL}/api/services/getServices`
            ); // Replace with your API endpoint
            const data = response.data;
            setServices(data);
        } catch (error) {
            console.error("Error fetching services:", error);
        }
    };
    useEffect(() => {
        fetchServices();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form submitted:", {
            currentId,
            name,
            description,
            status,
        });
        try {
            const res = await axios.put(
                `${BACKEND_URL}/api/services/services/${currentId}`,
                {
                    name,
                    description,
                    status,
                }
            );
            setIsEditDialogOpen(false);
            fetchServices();
        } catch (error) {}

        resetForm();
    };

    const handleEdit = (service: Service) => {
        setCurrentId(service._id);
        setCurrentService(service);
        setName(service.name);
        setDescription(service.description);
        setStatus(service.status);
        setIsEditDialogOpen(true);
    };

    const handleDelete = async (_id: string) => {
        try {
            await axios.delete(
                `${BACKEND_URL}/api/services/deleteService/${_id}`
            );
            // setServices(services.filter((service) => service._id !== _id));
            fetchServices();
        } catch (error) {
            console.error("Error deleting service:", error);
        }
    };

    const resetForm = () => {
        setCurrentService(null);
        setName("");
        setDescription("");
        setStatus("Operational");
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Services</h1>
                <Dialog
                    open={isAddDialogOpen}
                    onOpenChange={setIsAddDialogOpen}
                >
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="mr-2 h-4 w-4" /> Add Service
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        {/* <DialogHeader>
                            <DialogTitle>Add New Service</DialogTitle>
                        </DialogHeader> */}
                        {/* <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="name">Service Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={status}
                                    onValueChange={(
                                        value:
                                            | "Operational"
                                            | "Degraded"
                                            | "Outage"
                                    ) => setStatus(value)}
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Operational">
                                            Operational
                                        </SelectItem>
                                        <SelectItem value="Degraded">
                                            Degraded
                                        </SelectItem>
                                        <SelectItem value="Outage">
                                            Outage
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" className="w-full">
                                Add Service
                            </Button>
                        </form> */}
                        <ServiceForm setIsAddDialogOpen />
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Service Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {services.map((service) => (
                                <TableRow key={service._id}>
                                    <TableCell>{service.name}</TableCell>
                                    <TableCell>{service.description}</TableCell>
                                    <TableCell>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                                service.status
                                            )}`}
                                        >
                                            {service.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(service)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                handleDelete(service._id)
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Service</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="edit-name">Service Name</Label>
                            <Input
                                id="edit-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-description">
                                Description
                            </Label>
                            <Input
                                id="edit-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-status">Status</Label>
                            <Select
                                value={status}
                                onValueChange={(
                                    value: "Operational" | "Degraded" | "Outage"
                                ) => setStatus(value)}
                            >
                                <SelectTrigger id="edit-status">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Operational">
                                        Operational
                                    </SelectItem>
                                    <SelectItem value="Degraded">
                                        Degraded
                                    </SelectItem>
                                    <SelectItem value="Outage">
                                        Outage
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button type="submit" className="w-full">
                            Update Service
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function getStatusColor(status: string): string {
    switch (status) {
        case "Operational":
            return "bg-green-100 text-green-800";
        case "Degraded":
            return "bg-yellow-100 text-yellow-800";
        case "Outage":
            return "bg-red-100 text-red-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
}
