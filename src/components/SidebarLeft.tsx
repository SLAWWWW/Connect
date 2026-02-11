import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, ThumbsUp, User as UserIcon, Users } from "lucide-react";
import { Link } from "wouter";

import { useEffect, useState } from "react";
import type { User } from "@/types";
import { api } from "@/lib/api";
import { DEMO_USER_ID } from "@/lib/constants";

export default function SidebarLeft() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [groupsJoined, setGroupsJoined] = useState<number>(0);
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
  }, []);

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
    <div className="w-80 flex flex-col gap-4 z-10 pointer-events-auto h-[85vh]">
      {/* Profile Card */}
      <Card className="glass-panel border-none text-foreground">
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
            </Avatar>
            <div>
              <div className="font-bold text-lg">{user.name}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-widest">{user.location}</div>
            </div>
          </div>

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
        </CardContent>
      </Card>

      {/* Friends List */}
      <Card className="glass-panel border-none text-foreground flex-1 flex flex-col min-h-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-muted-foreground uppercase">Friends</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0 gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8 glass-input rounded-full h-9 border-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-3 mt-2">
              {friends.map((friend, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
                  <Avatar className="h-9 w-9 border border-white/10 group-hover:border-primary/50 transition-colors">
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      <UserIcon className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="text-sm font-medium truncate group-hover:text-primary transition-colors">{friend.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${friend.status === 'Online' ? 'bg-green-500 shadow-[0_0_5px_theme(colors.green.500)]' : 'bg-yellow-500'}`} />
                      {friend.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card className="glass-panel border-none text-foreground">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-lg p-3 text-center border border-white/5 hover:border-primary/30 transition-colors">
              <div className="text-primary mb-1 flex justify-center"><ThumbsUp size={18} /></div>
              <div className="text-2xl font-bold font-rajdhani">{user.liked_by?.length || 0}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Likes Received</div>
            </div>
            <Link href="/groups">
              <div className="bg-white/5 rounded-lg p-3 text-center border border-white/5 hover:border-secondary/30 transition-colors cursor-pointer group">
                <div className="text-secondary mb-1 flex justify-center group-hover:scale-110 transition-transform"><Users size={18} /></div>
                <div className="text-2xl font-bold font-rajdhani text-secondary">{groupsJoined}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Groups Joined</div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
