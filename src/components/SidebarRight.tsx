import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Star, User } from "lucide-react";

export default function SidebarRight() {
  const ratings = [
    { name: "John S.", rating: 4 },
    { name: "Emily R.", rating: 5 },
    { name: "David K.", rating: 3 },
  ];

  return (
    <div className="w-80 flex flex-col gap-4 z-10 pointer-events-auto h-[85vh]">
      
      {/* Create Group Form */}
      <Card className="glass-panel border-none text-foreground">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg tracking-wider font-bold text-primary uppercase">Create Group</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-1">
                <Label className="text-xs uppercase text-muted-foreground">Activity</Label>
                <Select>
                    <SelectTrigger className="glass-input h-9 border-none">
                        <SelectValue placeholder="Select Activity" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="badminton">Badminton</SelectItem>
                        <SelectItem value="basketball">Basketball</SelectItem>
                        <SelectItem value="gaming">Gaming</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 space-y-1">
                    <Label className="text-xs uppercase text-muted-foreground">Location</Label>
                    <Input className="glass-input h-9 border-none" placeholder="Gym / Court" />
                </div>
                 <div className="space-y-1">
                    <Label className="text-xs uppercase text-muted-foreground">Age</Label>
                    <Input className="glass-input h-9 border-none text-center" placeholder="18-25" />
                </div>
            </div>
            
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold tracking-widest uppercase">
                Create
            </Button>
        </CardContent>
      </Card>

      {/* Find Activity Action */}
      <div className="glass-panel rounded-xl p-4 space-y-4 border border-primary/20 bg-primary/5">
        <Button className="w-full h-12 text-lg font-bold bg-primary text-black hover:bg-primary/90 shadow-[0_0_20px_rgba(0,204,255,0.4)] animate-pulse">
            FIND ACTIVITY NOW!
        </Button>
        <div className="flex items-center justify-between px-1">
            <Label className="text-sm font-medium text-white/80">Looking for +1s</Label>
            <Switch className="data-[state=checked]:bg-primary" />
        </div>
        
        <div className="bg-black/20 p-3 rounded text-xs text-muted-foreground border border-white/5">
            <span className="text-primary font-bold">NEXT:</span> Joining Badminton with Sarah K. at 18:00
        </div>
      </div>

      {/* Ratings */}
      <Card className="glass-panel border-none text-foreground flex-1 flex flex-col min-h-0">
        <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-bold text-muted-foreground uppercase">Ratings</CardTitle>
                <span className="text-xs text-secondary font-bold">My Rating: 4.5/5</span>
            </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto">
            <div className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Rate Recent Activity</div>
            <div className="space-y-3">
                {ratings.map((user, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded bg-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-2">
                             <Avatar className="h-8 w-8">
                                <AvatarImage src={undefined} />
                                <AvatarFallback className="bg-muted text-muted-foreground">
                                  <User className="h-4 w-4" />
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{user.name}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <div className="flex text-secondary text-[10px]">
                                {[1,2,3,4,5].map(star => (
                                    <Star key={star} size={10} fill={star <= user.rating ? "currentColor" : "none"} />
                                ))}
                            </div>
                            <Button variant="ghost" size="sm" className="h-5 text-[10px] uppercase text-primary hover:text-primary hover:bg-primary/10 px-2">
                                Rate Back
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
