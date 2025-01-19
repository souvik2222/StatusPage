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
import axios from "axios";

interface Service {
    name: string;
    description: string;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function ServiceForm({ setIsAddDialogOpen }: any) {
    const [services, setServices] = useState<Service[]>([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (name && description) {
            try {
                const res = await axios.post(
                    `${BACKEND_URL}/api/services/services`,
                    {
                        name,
                        description,
                    }
                );
                setIsAddDialogOpen(false);
            } catch (error) {
                console.error("Error adding service:", error);
            }
            // setServices([...services, { name, description }]);
            setName("");
            setDescription("");
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Add a Service</CardTitle>
                <CardDescription>
                    Enter the details of the service you want to add.
                </CardDescription>
            </CardHeader>
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
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full">
                        Add Service
                    </Button>
                </CardFooter>
            </form>
            {services.length > 0 && (
                <CardContent>
                    <h3 className="font-semibold mb-2">Added Services:</h3>
                    <ul className="list-disc pl-5 space-y-2">
                        {services.map((service, index) => (
                            <li key={index}>
                                <strong>{service.name}</strong>:{" "}
                                {service.description}
                            </li>
                        ))}
                    </ul>
                </CardContent>
            )}
        </Card>
    );
}
