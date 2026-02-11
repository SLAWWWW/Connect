from typing import List, Dict, Any, Tuple
from sentence_transformers import SentenceTransformer, util
import numpy as np

# Load model once
_model = None

def get_model():
    global _model
    if _model is None:
        print("Loading SentenceTransformer model...")
        _model = SentenceTransformer('all-MiniLM-L6-v2')
    return _model

def calculate_semantic_score(text1: str, text2: str) -> int:
    """Calculates semantic similarity between two texts (0-100)."""
    if not text1 or not text2:
        return 0
        
    model = get_model()
    embedding1 = model.encode(text1, convert_to_tensor=True)
    embedding2 = model.encode(text2, convert_to_tensor=True)
    similarity = util.cos_sim(embedding1, embedding2).item()
    return int(max(0, similarity) * 100)

def is_age_in_range(user_age: int, age_group_str: str) -> bool:
    """
    Parses age range strings like:
    - "18-25"
    - "21+"
    - "All Ages"
    """
    if not age_group_str or age_group_str == "All Ages":
        return True
    
    try:
        # Handle "21+" format
        if "+" in age_group_str:
            min_age = int(age_group_str.replace("+", "").strip())
            return user_age >= min_age
            
        # Handle "18-25" format
        if "-" in age_group_str:
            parts = age_group_str.split("-")
            min_age = int(parts[0].strip())
            max_age = int(parts[1].strip())
            return min_age <= user_age <= max_age
            
        # Handle single number (exact match? or treated as min?)
        # For safety, treat as exact match or loose string match
        return str(user_age) == age_group_str
        
    except ValueError:
        return False # Fallback

def calculate_relevance_details(user: Dict[str, Any], group: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculates detailed relevance metrics.
    Returns: {'total': int, 'breakdown':Dict[str, int]}
    
    Scoring Rules:
    - Semantic Interest: 0-100
    - Location: +50 (Exact)
    - Age Group: +30 (In Range)
    """
    breakdown = {}
    
    # 1. Semantic Interest
    semantic_score = 0
    user_interests = user.get("interests", [])
    group_activity = group.get("activity", "")
    
    if user_interests and group_activity:
        similarities = [calculate_semantic_score(interest, group_activity) for interest in user_interests]
        semantic_score = max(similarities) if similarities else 0
    breakdown["semantic"] = semantic_score

    # 2. Location
    location_score = 0
    if user.get("location", "").lower() == group.get("location", "").lower():
        location_score = 50
    breakdown["location"] = location_score
        
    # 3. Age Group
    age_score = 0
    age_group = group.get("age_group", "All Ages")
    # Bonus for being in range (or All Ages)
    if is_age_in_range(user.get("age", 0), age_group):
        age_score = 30
    breakdown["age"] = age_score
    
    total = semantic_score + location_score + age_score
    
    return {
        "total": total,
        "breakdown": breakdown
    }

def get_recommended_groups(user: Dict[str, Any], all_groups: List[Dict[str, Any]], limit: int = 10) -> List[Dict[str, Any]]:
    """
    Returns list of groups with 'relevance_score' and 'score_breakdown' fields added.
    Sorted by relevance.
    """
    user_id = user.get("id")
    scored_groups = []
    
    # Pre-load model
    get_model()
    
    for group in all_groups:
        # Skip if already a member
        if user_id in group.get("members", []):
            continue
            
        result = calculate_relevance_details(user, group)
        score = result["total"]
        
        # Inject score data into a copy of the group dict
        group_with_score = group.copy()
        group_with_score["relevance_score"] = score
        group_with_score["score_breakdown"] = result["breakdown"]
        scored_groups.append(group_with_score)
    
    # Sort by score descending
    scored_groups.sort(key=lambda g: g["relevance_score"], reverse=True)
    
    return scored_groups[:limit]
