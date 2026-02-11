import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Heart } from "lucide-react";
import { useLocation } from "wouter";
import { api } from "@/lib/api";
import type { User } from "@/types";
import { toast } from "sonner";
import { DEMO_USER_ID } from "@/lib/constants";

export default function Mutuals() {
    const [, navigate] = useLocation();
    const [mutuals, setMutuals] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMutuals = async () => {
            try {
                // Fetch current user
                const userRes = await api.get<User>(`/api/v1/users/${DEMO_USER_ID}`);
                setCurrentUser(userRes.data);

                // Fetch all users
                const usersRes = await api.get<User[]>("/api/v1/users/");

                // Find mutuals: users who have liked the demo user AND who the demo user has liked
                const mutualUsers = usersRes.data.filter(user =>
                    user.id !== DEMO_USER_ID && // Not the current user
                    user.liked_by?.includes(DEMO_USER_ID) && // Current user has liked them
                    userRes.data.liked_by?.includes(user.id) // They have liked current user back
                );

                setMutuals(mutualUsers);
            } catch (error) {
                console.error("Failed to fetch mutuals:", error);
                toast.error("Failed to load mutuals");
            } finally {
                setLoading(false);
            }
        };

        fetchMutuals();
    }, []);

    const getSharedInterests = (user: User): string[] => {
        if (!currentUser) return [];
        return user.interests.filter(interest =>
            currentUser.interests.includes(interest)
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-8 overflow-auto">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-primary/20 pb-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-primary hover:bg-primary/10"
                            onClick={() => navigate("/")}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-4xl font-bold font-rajdhani text-primary tracking-wider uppercase drop-shadow-[0_0_10px_rgba(0,204,255,0.4)]">
                                Mutuals
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                People you've connected with
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-primary">
                        <Heart className="w-5 h-5 fill-current" />
                        <span className="text-2xl font-bold font-rajdhani">{mutuals.length}</span>
                    </div>
                </div>

                {/* Mutuals Grid */}
                {mutuals.length === 0 ? (
                    <Card className="glass-panel border-primary/10">
                        <CardContent className="py-16 text-center">
                            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h3 className="text-xl font-bold mb-2">No Mutuals Yet</h3>
                            <p className="text-muted-foreground mb-6">
                                Start connecting by liking people in the community!<br />
                                When they like you back, they'll appear here.
                            </p>
                            <Button onClick={() => navigate("/")}>
                                Explore Community
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {mutuals.map((mutual) => {
                            const sharedInterests = getSharedInterests(mutual);

                            return (
                                <Card
                                    key={mutual.id}
                                    className="glass-panel border-primary/10 hover:border-primary/40 transition-all cursor-pointer group"
                                    onClick={() => navigate(`/profile/${mutual.id}`)}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <Avatar className="w-16 h-16 border-2 border-primary/50 ring-2 ring-primary/20">
                                                <AvatarFallback className="bg-background text-primary text-lg font-bold">
                                                    {mutual.name.slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">
                                                    {mutual.name}
                                                </h3>
                                                <p className="text-sm text-muted-foreground mb-3">
                                                    {mutual.location}
                                                </p>

                                                {sharedInterests.length > 0 && (
                                                    <div className="space-y-2">
                                                        <div className="text-xs font-semibold text-muted-foreground uppercase">
                                                            Shared Interests
                                                        </div>
                                                        <div className="flex flex-wrap gap-1">
                                                            {sharedInterests.slice(0, 3).map((interest, idx) => (
                                                                <Badge
                                                                    key={idx}
                                                                    variant="outline"
                                                                    className="text-[10px] border-primary/20 text-primary/80"
                                                                >
                                                                    {interest}
                                                                </Badge>
                                                            ))}
                                                            {sharedInterests.length > 3 && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-[10px] border-primary/20 text-primary/80"
                                                                >
                                                                    +{sharedInterests.length - 3}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <Heart
                                                className="w-5 h-5 text-red-400 fill-current shrink-0 mt-1"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
