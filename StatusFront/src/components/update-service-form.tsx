import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Service {
    name: string;
    description: string;
    status: string;
}

const statusOptions = [
    "Operational",
    "Partial Outage",
    "Degraded Performance",
    "Major Outage",
    "Under Maintenance",
] as const;

type Status = (typeof statusOptions)[number];

export default function UpdateServiceForm() {
    const [services, setServices] = useState<Service[]>([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState<Status>("Operational");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && description) {
            setServices([...services, { name, description, status }]);
            setName("");
            setDescription("");
            setStatus("Operational");
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            {/* <CardHeader>
                <CardTitle>Update Service</CardTitle>
                <CardDescription>
                    Modify the details of the service.
                </CardDescription>
            </CardHeader> */}
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Service Name</Label>
                        <Input
                            id="name"
                            placeholder="Enter service name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe the service"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={status}
                            onValueChange={(value: Status) => setStatus(value)}
                        >
                            <SelectTrigger id="status">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((option) => (
                                    <SelectItem key={option} value={option}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full">
                        Update Service
                    </Button>
                </CardFooter>
            </form>
            {services.length > 0 && (
                <CardContent>
                    <h3 className="font-semibold mb-2">Updated Services:</h3>
                    <ul className="list-disc pl-5 space-y-2">
                        {services.map((service, index) => (
                            <li key={index}>
                                <strong>{service.name}</strong>:{" "}
                                {service.description} -
                                <span
                                    className={`font-semibold ${getStatusColor(
                                        service.status
                                    )}`}
                                >
                                    {service.status}
                                </span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            )}
        </Card>
    );
}

function getStatusColor(status: string): string {
    switch (status) {
        case "Operational":
            return "text-green-600";
        case "Partial Outage":
            return "text-yellow-600";
        case "Degraded Performance":
            return "text-orange-600";
        case "Major Outage":
            return "text-red-600";
        case "Under Maintenance":
            return "text-blue-600";
        default:
            return "text-gray-600";
    }
}
