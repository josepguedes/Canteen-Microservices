def recommend_dish(
    liked: list[int],
    available: list[dict],
) -> int | None:

    if not available:
        return None
    
    available_by_id = {dish["id"]: dish for dish in available}
    available_categories = {}
    
    for dish in available:
        category = dish.get("dish_category", "unknown")
        if category not in available_categories:
            available_categories[category] = []
        available_categories[category].append(dish["id"])
    
    for dish_id in liked:
        if dish_id in available_by_id:
            return dish_id
    
    if liked:
        
        if available_categories:
            largest_category = max(
                available_categories.items(),
                key=lambda x: len(x[1])
            )
            return largest_category[1][0]  
    
    return available[0]["id"] if available else None
