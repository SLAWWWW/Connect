import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, ThumbsUp, User as UserIcon, Users } from "lucide-react";
import { Link } from "wouter";

import { useEffect, useState, useMemo } from "react";
import type { User } from "@/types";
import { api } from "@/lib/api";
import { DEMO_USER_ID } from "@/lib/constants";
import { toast } from "sonner";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AvatarImage } from "@/components/ui/avatar";

export default function SidebarLeft() {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [groupsJoined, setGroupsJoined] = useState<number>(0);
  const [mutualsCount, setMutualsCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [likingUserId, setLikingUserId] = useState<string | null>(null);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get<User>(`/api/v1/users/${DEMO_USER_ID}`);
        setUser(response.data);
        // Initialize selected interests or use user's interests
        setSelectedInterests(response.data.interests || []);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
    fetchUser();

    const fetchGroups = async () => {
      try {
        const response = await api.get<any[]>("/api/v1/groups/");
        // Count groups where user is a member
        const joinedCount = response.data.filter(group =>
          group.members?.includes(DEMO_USER_ID)
        ).length;
        setGroupsJoined(joinedCount);
      } catch (error) {
        console.error("Failed to fetch groups:", error);
      }
    };
    fetchGroups();

    const fetchAllUsers = async () => {
      try {
        const response = await api.get<User[]>("/api/v1/users/");
        setAllUsers(response.data);

        // Calculate mutuals count
        const currentUserData = await api.get<User>(`/api/v1/users/${DEMO_USER_ID}`);
        const mutuals = response.data.filter(u =>
          u.id !== DEMO_USER_ID &&
          u.liked_by?.includes(DEMO_USER_ID) &&
          currentUserData.data.liked_by?.includes(u.id)
        );
        setMutualsCount(mutuals.length);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    fetchAllUsers();
  }, []);

  const otherUsers = useMemo(() => {
    return allUsers.filter(u => u.id !== DEMO_USER_ID);
  }, [allUsers]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return otherUsers;
    const q = searchQuery.toLowerCase();
    return otherUsers.filter(
      u =>
        u.name.toLowerCase().includes(q) ||
        u.location.toLowerCase().includes(q) ||
        u.interests.some(i => i.toLowerCase().includes(q))
    );
  }, [otherUsers, searchQuery]);

  const getSharedInterests = (other: User): string[] => {
    if (!user) return [];
    return other.interests.filter(i => user.interests.includes(i));
  };

  const handleLike = async (targetId: string) => {
    if (likingUserId) return;
    setLikingUserId(targetId);
    try {
      await api.post(`/api/v1/users/${targetId}/like`);
      toast.success("Liked!");
      // Refresh users list
      const response = await api.get<User[]>("/api/v1/users/");
      setAllUsers(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to like user");
    } finally {
      setLikingUserId(null);
    }
  };

  const handleUnlike = async (targetId: string) => {
    if (likingUserId) return;
    setLikingUserId(targetId);
    try {
      await api.post(`/api/v1/users/${targetId}/unlike`);
      toast.success("Unliked");
      // Refresh users list
      const response = await api.get<User[]>("/api/v1/users/");
      setAllUsers(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to unlike user");
    } finally {
      setLikingUserId(null);
    }
  };

  const hasLiked = (targetUser: User): boolean => {
    return (targetUser.liked_by || []).includes(DEMO_USER_ID);
  };

  const toggleInterest = (tag: string) => {
    setSelectedInterests(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };
  const friends = [
    { name: "Sarah K.", status: "Online" },
    { name: "John D.", status: "In Game" },
    { name: "Mike R.", status: "Away" },
    { name: "Elena V.", status: "Online" },
  ];

  if (!user) return <div className="w-80 h-[85vh] flex items-center justify-center glass-panel"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  return (
    <div className="w-80 flex flex-col gap-4 z-10 pointer-events-auto h-[85vh] overflow-hidden">
      {/* Profile Card */}
      <Card className="glass-panel border-none text-foreground shrink-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg tracking-wider font-bold text-primary uppercase flex items-center gap-2">
            My Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-12 w-12 border-2 border-primary ring-2 ring-primary/20">
              <AvatarFallback className="bg-muted text-muted-foreground">
                <UserIcon className="h-6 w-6" />
              </AvatarFallback>
            </Avatar >
            <div>
              <div className="font-bold text-lg">{user.name}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-widest">{user.location}</div>
            </div>
          </div >

          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase">Interests</div>
            <div className="flex flex-wrap gap-2">
              {(user.interests || []).map((tag) => {
                const isSelected = selectedInterests.includes(tag);
                return (
                  <Badge
                    key={tag}
                    onClick={() => toggleInterest(tag)}
                    className={`cursor-pointer transition-all border ${isSelected
                      ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                      : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                      }`}
                  >
                    {tag}
                  </Badge>
                );
              })}
            </div>
          </div>
        </CardContent >
      </Card >

      {/* Community Members */}
      < Card className="glass-panel border-none text-foreground flex-1 flex flex-col min-h-0 overflow-hidden" >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase">Community</CardTitle>
            <span className="text-[10px] text-primary font-bold">{otherUsers.length} member{otherUsers.length !== 1 ? "s" : ""}</span>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-4">
          <div className="flex flex-col gap-3 h-full">
            <div className="relative shrink-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name, location, interest..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 glass-input rounded-full h-9 border-none focus-visible:ring-1 focus-visible:ring-primary text-xs"
              />
            </div>

            <ScrollArea className="flex-1 min-h-0">
              <div className="space-y-3 pr-4">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-xs text-muted-foreground">
                    No members found
                  </div>
                ) : (
                  filteredUsers.map((member) => {
                    const liked = hasLiked(member);
                    const shared = getSharedInterests(member);

                    return (
                      <div
                        key={member.id}
                        className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-all cursor-pointer group border border-transparent hover:border-white/10"
                        onClick={() => window.location.hash = `/profile/${member.id}`}
                      >
                        <Avatar className="h-9 w-9 border border-white/10 group-hover:border-primary/50 transition-colors mt-0.5">
                          <AvatarFallback>{member.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                              {member.name}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`h-6 w-6 p-0 shrink-0 transition-all ${liked
                                ? "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                : "text-muted-foreground hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100"
                                }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                liked ? handleUnlike(member.id) : handleLike(member.id);
                              }}
                              disabled={likingUserId === member.id}
                            >
                              <Heart
                                size={14}
                                fill={liked ? "currentColor" : "none"}
                                className={likingUserId === member.id ? "animate-pulse" : ""}
                              />
                            </Button>
                          </div>
                          <div className="text-[11px] text-muted-foreground/70 flex items-center gap-1">
                            {member.location}
                          </div>
                          {shared.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {shared.slice(0, 3).map(interest => (
                                <Badge
                                  key={interest}
                                  className="text-[9px] h-4 px-1.5 bg-primary/10 text-primary border-primary/20 font-normal"
                                >
                                  {interest}
                                </Badge>
                              ))}
                              {shared.length > 3 && (
                                <span className="text-[9px] text-muted-foreground/50">+{shared.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card >

      {/* Stats */}
      < Card className="glass-panel border-none text-foreground shrink-0" >
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/5 rounded-lg p-3 text-center border border-white/5 hover:border-primary/30 transition-colors">
              <div className="text-primary mb-1 flex justify-center"><ThumbsUp size={16} /></div>
              <div className="text-xl font-bold font-rajdhani">{user.liked_by?.length || 0}</div>
              <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Likes</div>
            </div>
            <Link href="/mutuals">
              <div className="bg-white/5 rounded-lg p-3 text-center border border-white/5 hover:border-red-400/30 transition-colors cursor-pointer group">
                <div className="text-red-400 mb-1 flex justify-center group-hover:scale-110 transition-transform"><Heart size={16} /></div>
                <div className="text-xl font-bold font-rajdhani text-red-400">{mutualsCount}</div>
                <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Mutuals</div>
              </div>
            </Link>
            <Link href="/groups">
              <div className="bg-white/5 rounded-lg p-3 text-center border border-white/5 hover:border-secondary/30 transition-colors cursor-pointer group">
                <div className="text-secondary mb-1 flex justify-center group-hover:scale-110 transition-transform"><Users size={16} /></div>
                <div className="text-xl font-bold font-rajdhani text-secondary">{groupsJoined}</div>
                <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Groups</div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card >
    </div >
  );
}
