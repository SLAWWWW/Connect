import { Suspense, useEffect, useState } from "react";
import Globe from "@/components/Globe";
import SidebarLeft from "@/components/SidebarLeft";
import SidebarRight from "@/components/SidebarRight";
import { Loader2, Wifi, WifiOff } from "lucide-react";
import { api } from "@/lib/api";

interface HomeProps {
    targetSection?: string;
}

export default function Home({ targetSection }: HomeProps) {
    const [backendStatus, setBackendStatus] = useState<"checking" | "connected" | "error">("checking");

    useEffect(() => {
        const checkConnection = async () => {
            try {
                await api.get("/");
                setBackendStatus("connected");
            } catch (error) {
                console.error("Backend connection failed:", error);
                setBackendStatus("error");
            }
        };
        checkConnection();
    }, []);

    return (
        <div className="relative w-full h-screen overflow-hidden flex items-center justify-between px-8 py-4">
            {/* Header */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 text-center">
                <h1 className="text-5xl font-bold tracking-[0.2em] text-white drop-shadow-[0_0_10px_rgba(0,204,255,0.8)] font-rajdhani select-none pointer-events-none">
                    CONNECT
                </h1>
            </div>

            {/* 3D Background */}
            <div className="absolute inset-0 z-0">
                <Suspense fallback={
                    <div className="w-full h-full flex items-center justify-center text-primary">
                        <Loader2 className="animate-spin w-10 h-10" />
                    </div>
                }>
                    <Globe />
                </Suspense>
            </div>

            {/* UI Layer */}
            <div className="z-10 relative h-full flex items-center pointer-events-none">
                <SidebarLeft />
            </div>

            <div className="z-10 relative h-full flex items-center pointer-events-none">
                <SidebarRight />
            </div>

            {/* Overlay Vignette/Scanlines for aesthetic */}
            <div className="absolute inset-0 pointer-events-none z-30 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] mix-blend-multiply" />
            <div className="absolute inset-0 pointer-events-none z-30 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

            {/* Backend Status Indicator */}
            <div className="absolute bottom-4 left-4 z-50 flex items-center gap-2 text-xs font-mono">
                {backendStatus === "checking" && <span className="text-yellow-500 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Connecting...</span>}
                {backendStatus === "connected" && <span className="text-green-500 flex items-center gap-1"><Wifi className="w-3 h-3" /> System Online</span>}
                {backendStatus === "error" && <span className="text-red-500 flex items-center gap-1"><WifiOff className="w-3 h-3" /> Connection Lost</span>}
            </div>
        </div>
    );
}
