def recommend_dish(
    liked: list[int],
    available: list[int],
) -> int | None:
    for dish_id in liked:
        if dish_id in available:
            return dish_id

    return available[0] if available else None
