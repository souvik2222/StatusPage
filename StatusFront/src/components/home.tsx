import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import axios from "axios";
import { io } from "socket.io-client";

interface Service {
    name: string;
    status: "Operational" | "Degraded" | "Outage";
}

interface Incident {
    id: string;
    description: string;
    serviceName: string;
    impactOnService:
        | "Operational"
        | "Partial Outage"
        | "Degraded Performance"
        | "Major Outage"
        | "Under Maintenance";
    status: "Open" | "In Progress" | "Resolved";
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function HomePage() {
    const [services, setServices] = useState<Service[]>();
    const [incidents, setIncidents] = useState<Incident[]>();
    const socket = useRef<any>(null);
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
    const fetchIncidents = async () => {
        try {
            const response = await axios(
                `${BACKEND_URL}/api/incidents/incidents`
            ); // Replace with your API endpoint
            const data = response.data;
            console.log(data);

            setIncidents(data);
        } catch (error) {
            console.error("Error fetching services:", error);
        }
    };
    useEffect(() => {
        fetchServices();
        fetchIncidents();
    }, []);

    useEffect(() => {
        socket.current = io(BACKEND_URL, {
            transports: ["websocket"],
            reconnection: true,
        });

        socket.current.on("serviceCreated", (newService: Service) => {
            setServices((prevServices) => [...prevServices, newService]);
        });

        socket.current.on("serviceUpdated", (updatedService) => {
            setServices((prevServices) =>
                prevServices.map((service) =>
                    service._id === updatedService._id
                        ? updatedService
                        : service
                )
            );
        });

        socket.current.on("serviceDeleted", (deletedService) => {
            setServices((prevServices) =>
                prevServices.filter(
                    (service) => service._id !== deletedService._id
                )
            );
        });

        socket.current.on("incidentCreated", (newIncident) => {
            setIncidents((prevIncidents) => [...prevIncidents, newIncident]);
        });

        socket.current.on("incidentUpdated", (updatedIncident) => {
            setIncidents((prevIncidents) =>
                prevIncidents.map((incident) =>
                    incident._id === updatedIncident._id
                        ? updatedIncident
                        : incident
                )
            );
        });

        socket.current.on("incidentDeleted", (deletedIncident) => {
            setIncidents((prevIncidents) =>
                prevIncidents.filter(
                    (incident) => incident._id !== deletedIncident._id
                )
            );
        });

        return () => {
            if (socket.current) {
                socket.current.disconnect();
            }
        };
    }, []);

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold font-serif border-dashed border-b">
                    AlgoStatus
                </h1>
                <Button>
                    <NavLink to="/login">Login</NavLink>
                </Button>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Services</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Service Name</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {services?.map((service) => (
                                <TableRow key={service.name}>
                                    <TableCell className="text-left">
                                        {service.name}
                                    </TableCell>
                                    <TableCell className="text-left">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                                service.status
                                            )}`}
                                        >
                                            {service.status}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card className="mb-6">
                <CardHeader className="border-b">
                    <CardTitle>Ongoing Incidents / Maintenance</CardTitle>
                </CardHeader>

                {incidents?.filter((incident) => incident.status !== "Resolved")
                    ?.length === 0 ? (
                    <p className="text-center text-muted-foreground py-10">
                        No incidents found
                    </p>
                ) : (
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Affected Services</TableHead>
                                    <TableHead>Impact</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="text-left">
                                {incidents
                                    ?.filter(
                                        (incident) =>
                                            incident.status !== "Resolved"
                                    )
                                    ?.map((incident) => (
                                        <TableRow key={incident.id}>
                                            <TableCell>
                                                {incident.description}
                                            </TableCell>
                                            <TableCell>
                                                {incident.serviceName}
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getImpactColor(
                                                        incident.impactOnService
                                                    )}`}
                                                >
                                                    {incident.impactOnService}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {incident.status}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                )}
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Resolved Incidents / Maintenance</CardTitle>
                </CardHeader>
                {incidents?.filter((incident) => incident.status === "Resolved")
                    ?.length === 0 ? (
                    <p className="text-center text-muted-foreground py-10">
                        No incidents found
                    </p>
                ) : (
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Affected Services</TableHead>
                                    <TableHead>Impact</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {incidents
                                    ?.filter(
                                        (incident) =>
                                            incident.status === "Resolved"
                                    )
                                    ?.map((incident) => (
                                        <TableRow key={incident.id}>
                                            <TableCell>
                                                {incident.description}
                                            </TableCell>
                                            <TableCell>
                                                {incident.serviceName}
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getImpactColor(
                                                        incident.impactOnService
                                                    )}`}
                                                >
                                                    {incident.impactOnService}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                )}
            </Card>
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
