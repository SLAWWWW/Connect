from typing import List, Dict, Any, Tuple

def calculate_relevance_score(user: Dict[str, Any], group: Dict[str, Any]) -> int:
    """
    Calculates a relevance score for a group based on user profile.
    
    Scoring Rules:
    - +3 points: Activity matches one of User's interests.
    - +2 points: Location matches exact string.
    - +1 point: Age group matches (basic string match for now).
    """
    score = 0
    
    # 1. Interest Match
    user_interests = [i.lower() for i in user.get("interests", [])]
    group_activity = group.get("activity", "").lower()
    
    if group_activity in user_interests:
        score += 3
        
    # 2. Location Match
    if user.get("location", "").lower() == group.get("location", "").lower():
        score += 2
        
    # 3. Age Group Match (Loose check)
    if group.get("age_group") == "All Ages":
        score += 1
    
    return score

def get_recommended_groups(user: Dict[str, Any], all_groups: List[Dict[str, Any]], limit: int = 10) -> List[Dict[str, Any]]:
    """
    Returns list of groups sorted by relevance score.
    Filter out groups user is already in.
    """
    user_id = user.get("id")
    scored_groups: List[Tuple[int, Dict[str, Any]]] = []
    
    for group in all_groups:
        # Skip if already a member
        if user_id in group.get("members", []):
            continue
            
        score = calculate_relevance_score(user, group)
        if score > 0: # Only return relevant groups
            scored_groups.append((score, group))
    
    # Sort by score descending
    scored_groups.sort(key=lambda x: x[0], reverse=True)
    
    # Return just the group objects
    return [g for s, g in scored_groups][:limit]
