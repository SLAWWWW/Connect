import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, MapPin, User as UserIcon } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { api } from "@/lib/api";
import type { Group, User } from "@/types";
import { toast } from "sonner";

export default function WaitingRoom() {
    const [, navigate] = useLocation();
    const params = useParams<{ groupId: string }>();
    const [group, setGroup] = useState<Group | null>(null);
    const [members, setMembers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGroupDetails = async () => {
            if (!params.groupId) return;

            try {
                // Fetch group data
                const groupRes = await api.get<Group[]>("/api/v1/groups/");
                const foundGroup = groupRes.data.find(g => g.id === params.groupId);

                if (!foundGroup) {
                    toast.error("Group not found");
                    navigate("/groups");
                    return;
                }

                setGroup(foundGroup);

                // Fetch all users to get member details
                const usersRes = await api.get<User[]>("/api/v1/users/");
                const groupMembers = usersRes.data.filter(user =>
                    foundGroup.members.includes(user.id)
                );
                setMembers(groupMembers);
            } catch (error) {
                console.error("Failed to fetch group details:", error);
                toast.error("Failed to load group");
            } finally {
                setLoading(false);
            }
        };

        fetchGroupDetails();
    }, [params.groupId, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!group) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background p-8 overflow-auto">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-primary/20 pb-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-primary hover:bg-primary/10"
                            onClick={() => navigate("/groups")}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-4xl font-bold font-rajdhani text-primary tracking-wider uppercase drop-shadow-[0_0_10px_rgba(0,204,255,0.4)]">
                                {group.name}
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                        </div>
                    </div>
                </div>

                {/* Group Info */}
                <Card className="glass-panel border-primary/10">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-primary">Group Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {group.activity.map((tag, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs border-primary/20 text-primary/80">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-primary" />
                                <span>{group.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-primary" />
                                <span>{group.members.length} / {group.max_members} Members</span>
                            </div>
                            <Badge variant="secondary" className="text-xs">{group.age_group}</Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Members Grid */}
                <Card className="glass-panel border-primary/10">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-primary flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Members ({members.length}/{group.max_members})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {members.map((member) => (
                                <Card
                                    key={member.id}
                                    className="glass-panel border-primary/10 hover:border-primary/40 transition-all"
                                >
                                    <CardContent className="p-4 flex flex-col items-center gap-3">
                                        <Avatar className="w-16 h-16 border-2 border-primary/50">
                                            <AvatarFallback className="bg-background text-primary text-lg font-bold">
                                                <UserIcon className="h-8 w-8" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="text-center w-full">
                                            <h3 className="font-bold text-sm truncate">{member.name}</h3>
                                            <p className="text-xs text-muted-foreground truncate">{member.location}</p>
                                            {member.id === group.admin_id && (
                                                <Badge variant="secondary" className="text-[10px] mt-2">Admin</Badge>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {/* Empty slots */}
                            {Array.from({ length: group.max_members - members.length }).map((_, idx) => (
                                <Card
                                    key={`empty-${idx}`}
                                    className="glass-panel border-primary/5 border-dashed"
                                >
                                    <CardContent className="p-4 flex flex-col items-center justify-center gap-3 min-h-[140px]">
                                        <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center">
                                            <Users className="w-6 h-6 text-primary/30" />
                                        </div>
                                        <span className="text-xs text-muted-foreground">Open Slot</span>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
