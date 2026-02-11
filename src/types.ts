export interface User {
    id: string;
    name: string;
    email: string;
    age: number;
    interests: string[];
    location: string;
    liked_by?: string[];
}

export interface Group {
    id: string;
    name: string;
    description: string;
    activity: string[];  // Changed from string to string[]
    location: string;
    max_members: number;
    age_group: string;
    members: string[];
    admin_id: string;
}

export interface GroupRecommendation extends Group {
    relevance_score: number;
    score_breakdown: {
        semantic: number;
        location: number;
        age: number;
    };
}
