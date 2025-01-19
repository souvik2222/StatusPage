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
import { Trash2, Plus } from "lucide-react";
import AddTeamMemberForm from "./add-member-form";
import axios from "axios";

interface TeamMember {
    _id: string;
    email: string;
    associatedServices: string;
}
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function TeamMembersPage() {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [services, setServices] = useState();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [email, setEmail] = useState("");

    const fetchMembers = async () => {
        try {
            const res = await axios.get(`${BACKEND_URL}/api/users`);
            setTeamMembers(res.data);
        } catch (error) {
            console.log(error);
        }
    };

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
        fetchMembers();
    }, []);

    const handleDelete = async (_id: string) => {
        try {
            const res = await axios.delete(`${BACKEND_URL}/api/users/${_id}`);
            fetchMembers();
        } catch (error) {
            console.log(error);
        }
    };

    const resetForm = () => {
        setEmail("");
        // setService(services[0]);
    };

    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Team Members</h1>
                <Dialog
                    open={isAddDialogOpen}
                    onOpenChange={setIsAddDialogOpen}
                >
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="mr-2 h-4 w-4" /> Add Team Member
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add New Team Member</DialogTitle>
                        </DialogHeader>
                        <AddTeamMemberForm />
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Email</TableHead>
                                <TableHead>Associated Service</TableHead>
                                <TableHead className="w-[100px]">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {teamMembers.map((member) => (
                                <TableRow key={member._id}>
                                    <TableCell>{member.email}</TableCell>
                                    <TableCell>
                                        {member.associatedServices}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                handleDelete(member._id)
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
        </div>
    );
}
