import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { DEMO_USER_ID, DEMO_USER_DATA } from "@/lib/constants";
import { toast } from "sonner";

export function useDemoUser() {
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        const initUser = async () => {
            try {
                // Try to get the user
                await api.get(`/api/v1/users/${DEMO_USER_ID}`);
                console.log("Demo user exists");
            } catch (error: any) {
                if (error.response?.status === 404) {
                    // User doesn't exist, create it
                    try {
                        await api.post("/api/v1/users/", {
                            ...DEMO_USER_DATA,
                            id: DEMO_USER_ID, // Ensure ID matches
                        });
                        toast.success("Demo user created!");
                    } catch (createError) {
                        console.error("Failed to create demo user:", createError);
                        toast.error("Failed to initialize demo user");
                    }
                } else {
                    console.error("Failed to check demo user:", error);
                }
            } finally {
                setIsInitializing(false);
            }
        };

        initUser();
    }, []);

    return { isInitializing };
}
