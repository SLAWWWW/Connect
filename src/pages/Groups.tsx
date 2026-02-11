import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Group, User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Users, MapPin, Activity, Plus } from "lucide-react";
import { DEMO_USER_ID } from "@/lib/constants";
import { useLocation } from "wouter";

export default function Groups() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setCreating] = useState(false);
    const [, navigate] = useLocation();

    // Form State
    const [newGroup, setNewGroup] = useState({
        name: "",
        description: "",
        activity: [] as string[], // Changed to array for tags
        location: "",
        max_members: "10",
        age_group: "All Ages"
    });
    const [activityInput, setActivityInput] = useState(""); // Temporary input for typing

    const fetchGroups = async () => {
        try {
            const res = await api.get<Group[]>("/api/v1/groups/");
            setGroups(res.data);
        } catch (error) {
            console.error("Failed to fetch groups:", error);
            toast.error("Failed to load groups");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const handleCreateGroup = async () => {
        try {
            await api.post("/api/v1/groups/", {
                ...newGroup,
                max_members: parseInt(newGroup.max_members)
            });
            toast.success("Group created successfully!");
            setNewGroup({ name: "", description: "", activity: [], location: "", max_members: "10", age_group: "All Ages" });
            setActivityInput("");
            fetchGroups(); // Refresh list
        } catch (error) {
            console.error("Failed to create group:", error);
            toast.error("Failed to create group");
        }
    };

    const handleActivityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            const trimmed = activityInput.trim();
            if (trimmed && !newGroup.activity.includes(trimmed)) {
                setNewGroup({ ...newGroup, activity: [...newGroup.activity, trimmed] });
                setActivityInput("");
            }
        } else if (e.key === "Backspace" && activityInput === "" && newGroup.activity.length > 0) {
            // Remove last tag on backspace when input is empty
            setNewGroup({ ...newGroup, activity: newGroup.activity.slice(0, -1) });
        }
    };

    const removeActivityTag = (tagToRemove: string) => {
        setNewGroup({ ...newGroup, activity: newGroup.activity.filter(tag => tag !== tagToRemove) });
    };

    const handleJoin = async (groupId: string) => {
        const group = groups.find(g => g.id === groupId);
        try {
            await api.post(`/api/v1/groups/${groupId}/join`);
            toast.success("Joined group!");
            const groupName = group?.name || "Community Room";
            navigate(`/waiting-room?group=${encodeURIComponent(groupName)}`);
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Failed to join group");
        }
    };

    const handleLeave = async (groupId: string) => {
        try {
            await api.post(`/api/v1/groups/${groupId}/leave`);
            toast.success("Left group!");
            fetchGroups();
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Failed to leave group");
        }
    };

    const handleDelete = async (groupId: string) => {
        if (!confirm("Are you sure you want to delete this group? This action cannot be undone.")) {
            return;
        }
        try {
            await api.delete(`/api/v1/groups/${groupId}`);
            toast.success("Group deleted!");
            fetchGroups();
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Failed to delete group");
        }
    };

    return (
        <div className="min-h-screen bg-background p-8 overflow-auto">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => navigate("/")}
                    >
                        <h1 className="text-4xl font-bold font-rajdhani text-primary tracking-wider uppercase drop-shadow-[0_0_10px_rgba(0,204,255,0.4)]">Community Groups</h1>
                        <p className="text-muted-foreground mt-2">Find your tribe or start a new collection.</p>
                    </div>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="font-bold tracking-widest uppercase"><Plus className="mr-2 h-4 w-4" /> Create Group</Button>
                        </DialogTrigger>
                        <DialogContent className="glass-panel border-primary/20 bg-black/90 text-foreground">
                            <DialogHeader>
                                <DialogTitle className="text-primary uppercase tracking-widest">Start a New Community</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Group Name</Label>
                                    <Input
                                        placeholder="e.g. Sunday Hikers"
                                        value={newGroup.name}
                                        onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
                                        className="glass-input"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea
                                        placeholder="What's this group about?"
                                        value={newGroup.description}
                                        onChange={e => setNewGroup({ ...newGroup, description: e.target.value })}
                                        className="glass-input"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Activity Tags</Label>
                                        <div className="glass-input min-h-[40px] flex flex-wrap gap-2 items-center p-2">
                                            {newGroup.activity.map((tag, index) => (
                                                <Badge
                                                    key={index}
                                                    variant="secondary"
                                                    className="bg-primary/20 text-primary border-primary/40 px-2 py-1 flex items-center gap-1"
                                                >
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeActivityTag(tag)}
                                                        className="ml-1 hover:text-primary/60 transition-colors"
                                                    >
                                                        ×
                                                    </button>
                                                </Badge>
                                            ))}
                                            <Input
                                                placeholder="Type and press space..."
                                                value={activityInput}
                                                onChange={e => setActivityInput(e.target.value)}
                                                onKeyDown={handleActivityKeyDown}
                                                className="border-none bg-transparent flex-1 min-w-[120px] focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">Press space or enter to add tags</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Location</Label>
                                        <Input
                                            placeholder="City or 'Online'"
                                            value={newGroup.location}
                                            onChange={e => setNewGroup({ ...newGroup, location: e.target.value })}
                                            className="glass-input"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Max Members</Label>
                                        <Input
                                            type="number"
                                            value={newGroup.max_members}
                                            onChange={e => setNewGroup({ ...newGroup, max_members: e.target.value })}
                                            className="glass-input"
                                        />
                                    </div>
                                </div>
                                <Button onClick={handleCreateGroup} className="w-full mt-4 font-bold uppercase tracking-widest">Create Group</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groups.map(group => {
                            const isMember = group.members.includes(DEMO_USER_ID);
                            const isFull = group.members.length >= group.max_members;

                            return (
                                <Card
                                    key={group.id}
                                    className="glass-panel border-primary/10 hover:border-primary/40 transition-all hover:shadow-[0_0_20px_rgba(0,204,255,0.1)] group cursor-pointer"
                                    onClick={() => navigate(`/waiting-room/${group.id}`)}
                                >
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-xl font-bold text-primary tracking-wide">{group.name}</CardTitle>
                                            <div className="flex flex-wrap gap-1 justify-end max-w-[50%]">
                                                {group.activity.map((tag, idx) => (
                                                    <Badge key={idx} variant="outline" className="text-[10px] border-primary/20 text-primary/80">{tag}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">{group.description}</p>

                                        <div className="space-y-2 text-xs text-muted-foreground uppercase tracking-wider font-medium">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-primary" /> {group.location}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-primary" /> {group.members.length} / {group.max_members} Members
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        {isMember ? (
                                            group.admin_id === DEMO_USER_ID ? (
                                                <Button
                                                    variant="destructive"
                                                    className="w-full opacity-0 group-hover:opacity-100 transition-opacity font-bold uppercase tracking-widest"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(group.id);
                                                    }}
                                                >
                                                    Delete Group
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="destructive"
                                                    className="w-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleLeave(group.id);
                                                    }}
                                                >
                                                    Leave Group
                                                </Button>
                                            )
                                        ) : (
                                            <Button
                                                className="w-full font-bold uppercase tracking-widest"
                                                disabled={isFull}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleJoin(group.id);
                                                }}
                                            >
                                                {isFull ? "Group Full" : "Join Group"}
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
