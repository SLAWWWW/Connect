import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Star } from "lucide-react";

import { useEffect, useState } from "react";
import type { GroupRecommendation } from "@/types";
import { api } from "@/lib/api";
import { Users } from "lucide-react"; // Import Users icon

export default function SidebarRight() {
    const [recommendations, setRecommendations] = useState<GroupRecommendation[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchRecommendations = async () => {
        setIsLoading(true);
        try {
            // Add slight delay to show the "Finding..." state (UX)
            await new Promise(resolve => setTimeout(resolve, 800));
            const res = await api.get<GroupRecommendation[]>("/api/v1/groups/recommended");
            setRecommendations(res.data);
        } catch (error) {
            console.error("Failed to fetch recommendations:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial fetch on mount
    useEffect(() => {
        fetchRecommendations();
    }, []);

    return (
        <div className="w-80 flex flex-col gap-4 z-10 pointer-events-auto h-[85vh]">

            {/* Explore Groups */}
            <Card className="glass-panel border-none text-foreground">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg tracking-wider font-bold text-primary uppercase">Community</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">Join a group to connect with others who share your interests.</p>
                    <Link href="/groups">
                        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold tracking-widest uppercase">
                            Explore Groups
                        </Button>
                    </Link>
                </CardContent>
            </Card>

            {/* Find Activity Action */}
            <div className="glass-panel rounded-xl p-4 space-y-4 border border-primary/20 bg-primary/5">
                <Button
                    onClick={fetchRecommendations}
                    disabled={isLoading}
                    className="w-full h-12 text-lg font-bold bg-primary text-black hover:bg-primary/90 shadow-[0_0_20px_rgba(0,204,255,0.4)] animate-pulse disabled:opacity-70 disabled:animate-none"
                >
                    {isLoading ? "FINDING..." : "FIND ACTIVITY NOW!"}
                </Button>
                <div className="flex items-center justify-between px-1">
                    <Label className="text-sm font-medium text-white/80">Looking for +1s</Label>
                    <Switch className="data-[state=checked]:bg-primary" />
                </div>

                <div className="bg-black/20 p-3 rounded text-xs text-muted-foreground border border-white/5">
                    <span className="text-primary font-bold">NEXT:</span> Joining Badminton with Sarah K. at 18:00
                </div>
            </div>

            {/* Recommended Groups */}
            <Card className="glass-panel border-none text-foreground flex-1 flex flex-col min-h-0">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-muted-foreground uppercase">Recommended For You</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto">
                    <div className="space-y-3">
                        {isLoading ? (
                            <div className="text-xs text-muted-foreground text-center py-4 animate-pulse">Analyzing interests...</div>
                        ) : recommendations.length === 0 ? (
                            <div className="text-xs text-muted-foreground text-center py-4">No recommendations found. Try updating your profile!</div>
                        ) : (
                            recommendations.map((group) => (
                                <Link key={group.id} href={`/groups/${group.id}`}>
                                    <div className="p-3 rounded bg-white/5 hover:bg-white/10 transition-colors border border-white/5 hover:border-primary/30 group cursor-pointer">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-sm text-primary group-hover:text-primary/80 transition-colors uppercase tracking-wider">{group.name}</h4>
                                            <Badge variant="outline" className="text-[10px] h-5 border-primary/20 text-primary bg-primary/10">
                                                {group.relevance_score} Match Score
                                            </Badge>
                                        </div>
                                        <div className="text-xs text-muted-foreground mb-2 line-clamp-2">{group.description}</div>
                                        <div className="flex items-center justify-between text-[10px] text-muted-foreground/70 uppercase tracking-wider">
                                            <span className="flex flex-wrap gap-1">
                                                {group.activity.slice(0, 2).map((tag, idx) => (
                                                    <span key={idx} className="text-primary">{tag}</span>
                                                ))}
                                                {group.activity.length > 2 && <span>+{group.activity.length - 2}</span>}
                                            </span>
                                            <span className="flex items-center gap-1"><Users size={10} /> {group.members?.length || 0}/{group.max_members}</span>
                                        </div>
                                        {/* Breakdown Mini-View */}
                                        <div className="mt-2 flex gap-1 text-[9px] text-muted-foreground/50">
                                            {group.score_breakdown?.semantic > 50 && <span className="text-green-400">Interest</span>}
                                            {group.score_breakdown?.location > 0 && <span className="text-blue-400">Location</span>}
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
