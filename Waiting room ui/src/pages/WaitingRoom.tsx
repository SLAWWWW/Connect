import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Send, Users, Search, Plus, Swords, Check } from "lucide-react";
import avatar1 from "@/assets/avatars/avatar1.jpg";
import avatar2 from "@/assets/avatars/avatar2.jpg";
import avatar3 from "@/assets/avatars/avatar3.jpg";
import avatar4 from "@/assets/avatars/avatar4.jpg";

const friendsData = [
    { name: "NeonRaider", status: "Online", img: avatar2 },
    { name: "CyberGoth", status: "In Match", img: avatar3 },
    { name: "PixelPunk", status: "Away", img: avatar4 },
    { name: "GlitchKing", status: "Online", img: avatar1 },
    { name: "VaporWitch", status: "Offline", img: null },
];

export default function WaitingRoom() {
  return (
    <div className="relative min-h-screen bg-[#050A18] text-white font-orbitron overflow-hidden flex flex-col p-6 gap-6">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,204,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,204,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050A18_90%)] pointer-events-none" />

        {/* Header */}
        <header className="relative z-10 flex justify-between items-center border-b border-[#00CCFF]/20 pb-4">
            <h1 className="text-4xl font-bold tracking-widest text-[#00CCFF] animate-flicker drop-shadow-[0_0_10px_rgba(0,204,255,0.8)]">
                WAITING ROOM
            </h1>
            <div className="flex gap-4">
                <Button variant="outline" className="border-[#00CCFF] text-[#00CCFF] hover:bg-[#00CCFF]/10 hover:text-white uppercase tracking-wider">
                    Settings
                </Button>
                <Button className="bg-[#00CCFF] text-black hover:bg-[#00CCFF]/80 font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(0,204,255,0.5)]">
                    Start Match <Swords className="ml-2 w-4 h-4" />
                </Button>
            </div>
        </header>

        {/* Main Content */}
        <div className="relative z-10 flex flex-1 gap-6 min-h-0">
            
            {/* Left Section: Party + Chat */}
            <div className="flex-[3] flex flex-col gap-6 min-h-0">
                
                {/* Party Room Grid */}
                <div className="flex-[2] bg-[#101827]/60 backdrop-blur-xl border border-[#00CCFF]/20 rounded-xl p-6 relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                    <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-[#00CCFF]/30 rounded-tl-xl pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-[#00CCFF]/30 rounded-br-xl pointer-events-none" />
                    
                    <h2 className="text-xl text-[#00CCFF]/80 mb-6 flex items-center gap-2 uppercase tracking-widest">
                        <Users className="w-5 h-5" /> Squad Roster (3/6)
                    </h2>

                    <div className="grid grid-cols-3 gap-6 h-[calc(100%-3rem)]">
                        {/* Occupied Slots */}
                        {[
                            { name: "PlayerOne", img: avatar1, ready: true },
                            { name: "SniperWolf", img: avatar2, ready: false },
                            { name: "TankMaster", img: avatar3, ready: true }
                        ].map((player, i) => (
                            <div key={i} className="relative group bg-[#0A0F1E]/80 border border-[#00CCFF]/20 hover:border-[#00CCFF] transition-all duration-300 rounded-lg flex flex-col items-center justify-center p-4 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(0,204,255,0.2)]">
                                <div className="absolute top-2 right-2">
                                    {player.ready ? (
                                        <div className="bg-green-500/20 text-green-400 border border-green-500/50 px-2 py-0.5 textxs rounded flex items-center gap-1">
                                            <Check className="w-3 h-3" /> READY
                                        </div>
                                    ) : (
                                        <div className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 px-2 py-0.5 text-xs rounded">
                                            NOT READY
                                        </div>
                                    )}
                                </div>
                                <div className="relative mb-3">
                                    <div className="absolute inset-0 bg-[#00CCFF] blur-md opacity-20 group-hover:opacity-40 transition-opacity rounded-full" />
                                    <Avatar className="w-20 h-20 border-2 border-[#00CCFF]/50 group-hover:border-[#00CCFF] transition-colors">
                                        <AvatarImage src={player.img} />
                                        <AvatarFallback>PL</AvatarFallback>
                                    </Avatar>
                                </div>
                                <h3 className="font-bold text-lg tracking-wide group-hover:text-[#00CCFF] transition-colors">{player.name}</h3>
                                <div className="mt-2 w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#00CCFF] w-[75%]" />
                                </div>
                            </div>
                        ))}

                        {/* Empty Slots */}
                        {[1, 2, 3].map((slot) => (
                            <div key={`empty-${slot}`} className="group bg-[#0A0F1E]/40 border border-white/5 border-dashed hover:border-[#00CCFF]/50 transition-all duration-300 rounded-lg flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-[#00CCFF]/5">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 border border-white/10 group-hover:border-[#00CCFF]/50">
                                    <Plus className="w-8 h-8 text-white/20 group-hover:text-[#00CCFF] transition-colors" />
                                </div>
                                <span className="text-white/30 text-sm group-hover:text-[#00CCFF] tracking-widest uppercase font-semibold">Invite</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Panel */}
                <div className="flex-1 bg-[#101827]/60 backdrop-blur-xl border-t border-[#00CCFF]/20 rounded-xl flex flex-col overflow-hidden shadow-lg min-h-[200px]">
                    <div className="bg-[#0A0F1E]/80 px-4 py-2 border-b border-[#00CCFF]/10 flex items-center justify-between">
                        <span className="text-xs text-[#00CCFF] uppercase tracking-widest font-bold">Squad Comms</span>
                        <span className="text-[10px] text-white/30">SECURE CHANNEL // ENCRYPTED</span>
                    </div>
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-3 text-sm">
                            <div className="flex gap-2">
                                <span className="text-white/30 text-[10px] pt-1 font-mono">[18:02]</span>
                                <span className="text-[#00CCFF] font-bold">SniperWolf:</span>
                                <span className="text-gray-300">Ready up guys!</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-white/30 text-[10px] pt-1 font-mono">[18:03]</span>
                                <span className="text-purple-400 font-bold">TankMaster:</span>
                                <span className="text-gray-300">Just fixing my loadout...</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-white/30 text-[10px] pt-1 font-mono">[18:04]</span>
                                <span className="text-[#00CCFF] font-bold">SniperWolf:</span>
                                <span className="text-gray-300">We need a healer. Invite Glitch?</span>
                            </div>
                        </div>
                    </ScrollArea>
                    <div className="p-3 bg-[#0A0F1E] border-t border-[#00CCFF]/10 flex gap-2">
                        <Input 
                            className="bg-[#101827] border-[#00CCFF]/20 text-white placeholder:text-gray-600 focus-visible:ring-[#00CCFF]/50 font-mono text-xs h-9" 
                            placeholder="Type message..." 
                        />
                        <Button size="icon" className="h-9 w-9 bg-[#00CCFF] text-black hover:bg-[#00CCFF]/80 hover:shadow-[0_0_10px_rgba(0,204,255,0.5)] transition-all">
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Right Sidebar: Friends */}
            <div className="flex-1 max-w-xs bg-[#101827]/60 backdrop-blur-xl border-l border-[#00CCFF]/20 flex flex-col min-h-0">
                <div className="p-4 border-b border-[#00CCFF]/10">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#00CCFF]/50" />
                        <Input 
                            className="pl-9 bg-[#0A0F1E] border-[#00CCFF]/20 text-white placeholder:text-gray-600 focus-visible:ring-[#00CCFF]/50 h-9 font-mono text-xs" 
                            placeholder="SEARCH AGENTS..." 
                        />
                    </div>
                </div>
                
                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1">
                        {friendsData.map((friend, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 rounded hover:bg-[#00CCFF]/10 transition-colors group cursor-pointer border border-transparent hover:border-[#00CCFF]/20">
                                <div className="relative">
                                    <Avatar className="h-10 w-10 border border-white/10 group-hover:border-[#00CCFF]/50">
                                        <AvatarImage src={friend.img || ""} />
                                        <AvatarFallback className="bg-[#0A0F1E] text-white text-xs">{friend.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#101827] ${
                                        friend.status === 'Online' ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 
                                        friend.status === 'In Match' ? 'bg-blue-500' : 'bg-gray-500'
                                    }`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-sm truncate group-hover:text-[#00CCFF] transition-colors">{friend.name}</div>
                                    <div className="text-[10px] text-gray-400 uppercase tracking-wide">{friend.status}</div>
                                </div>
                                <Button size="sm" className="h-7 text-[10px] bg-transparent border border-[#00CCFF]/30 text-[#00CCFF] hover:bg-[#00CCFF] hover:text-black font-bold opacity-0 group-hover:opacity-100 transition-all uppercase tracking-wider px-2">
                                    Invite
                                </Button>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                
                <div className="p-4 border-t border-[#00CCFF]/10 bg-[#0A0F1E]/50">
                    <div className="flex justify-between items-center text-xs text-gray-400 font-mono">
                        <span>ONLINE: 3</span>
                        <span>TOTAL: 142</span>
                    </div>
                </div>
            </div>

        </div>
    </div>
  );
}
