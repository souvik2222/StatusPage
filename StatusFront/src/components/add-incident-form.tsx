import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from "axios";

interface LogEntry {
    serviceName: string;
    type: "Incident" | "Maintenance";
    description: string;
    impact: string;
}

const services = [
    "User Authentication",
    "Payment Processing",
    "Data Storage",
    "Email Service",
    "API Gateway",
] as const;

const types = ["Incident", "Maintenance"] as const;

const impactLevels = [
    "Operational",
    "Partial Outage",
    "Degraded Performance",
    "Major Outage",
    "Under Maintenance",
] as const;

type Service = (typeof services)[number];
type Type = (typeof types)[number];
type ImpactLevel = (typeof impactLevels)[number];

export default function IncidentMaintenanceForm() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [services, setServices] = useState([]);
    const [serviceName, setServiceName] = useState<string>();
    const [type, setType] = useState<Type>("Incident");
    const [description, setDescription] = useState("");
    const [impact, setImpact] = useState<ImpactLevel>("Operational");
    const [error, setError] = useState<string | null>(null);
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    const fetchServices = async () => {
        try {
            const response = await axios(
                `${BACKEND_URL}/api/services/getServices`
            ); // Replace with your API endpoint
            const data = response.data;
            const names = data.map((service: any) => service.name);
            console.log(names);

            setServices(names);
        } catch (error) {
            console.error("Error fetching services:", error);
        }
    };
    useEffect(() => {
        fetchServices();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!serviceName || !type || !description || !impact) {
            setError("Please fill in all fields");
            return;
        }

        if (description.length < 10) {
            setError("Description must be at least 10 characters long");
            return;
        }

        const res = await axios.post(`${BACKEND_URL}/api/incidents`, {
            serviceName,
            type,
            description,
            impactOnService: impact,
        });

        //setLogs([...logs, { serviceName, type, description, impact }]);
        setDescription("");
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            {/* <CardHeader>
                <CardTitle>Log Incident / Maintenance</CardTitle>
                <CardDescription>
                    Enter the details of the incident or maintenance.
                </CardDescription>
            </CardHeader> */}
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="serviceName">Service Name</Label>
                        <Select
                            value={serviceName}
                            onValueChange={(value) => setServiceName(value)}
                        >
                            <SelectTrigger id="serviceName">
                                <SelectValue placeholder="Select service" />
                            </SelectTrigger>
                            <SelectContent>
                                {services.map((service) => (
                                    <SelectItem key={service} value={service}>
                                        {service}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <Select
                            value={type}
                            onValueChange={(value: Type) => setType(value)}
                        >
                            <SelectTrigger id="type">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                {types.map((t) => (
                                    <SelectItem key={t} value={t}>
                                        {t}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Short Description</Label>
                        <Input
                            id="description"
                            placeholder="Enter a short description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="impact">Impact on Service</Label>
                        <Select
                            value={impact}
                            onValueChange={(value: ImpactLevel) =>
                                setImpact(value)
                            }
                        >
                            <SelectTrigger id="impact">
                                <SelectValue placeholder="Select impact level" />
                            </SelectTrigger>
                            <SelectContent>
                                {impactLevels.map((level) => (
                                    <SelectItem key={level} value={level}>
                                        {level}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full">
                        Log Entry
                    </Button>
                </CardFooter>
            </form>
            {logs.length > 0 && (
                <CardContent>
                    <h3 className="font-semibold mb-2">Logged Entries:</h3>
                    <ul className="list-disc pl-5 space-y-2">
                        {logs.map((log, index) => (
                            <li key={index} className="text-sm">
                                <strong>{log.serviceName}</strong> - {log.type}
                                <br />
                                Description: {log.description}
                                <br />
                                Impact:{" "}
                                <span
                                    className={`font-semibold ${getImpactColor(
                                        log.impact
                                    )}`}
                                >
                                    {log.impact}
                                </span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            )}
        </Card>
    );
}

function getImpactColor(impact: string): string {
    switch (impact) {
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
