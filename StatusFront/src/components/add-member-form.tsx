import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function AddTeamMemberForm() {
    const [services, setServices] = useState<string[]>();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [service, setService] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    const fetchServices = async () => {
        try {
            const response = await axios(
                `${BACKEND_URL}/api/services/getServices`
            ); // Replace with your API endpoint
            const data = response.data;
            const names = data.map((service: any) => service.name);
            names.push("Admin");
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

        if (!email || !password || !service) {
            setError("Please fill in all fields");
            return;
        }

        if (!isValidEmail(email)) {
            setError("Please enter a valid email address");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }

        try {
            const res = await axios.post(`${BACKEND_URL}/api/users/new`, {
                email,
                password,
                associatedServices: service,
            });
            // fetchMembers();
        } catch (error) {}

        setEmail("");
        setPassword("");
        setService("");
    };

    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Enter email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="service">Associated Service</Label>
                        <Select
                            value={service}
                            onValueChange={(value) => setService(value)}
                        >
                            <SelectTrigger id="service">
                                <SelectValue placeholder="Select service" />
                            </SelectTrigger>
                            <SelectContent>
                                {services?.map((service) => (
                                    <SelectItem key={service} value={service}>
                                        {service}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full">
                        Add Team Member
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
