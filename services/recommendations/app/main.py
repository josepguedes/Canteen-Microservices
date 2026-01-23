from datetime import date
from fastapi import FastAPI, Depends, Query, HTTPException

from app.auth import get_current_user, get_token
from app.db import get_connection
from app.clients.users_service import get_liked_dishes
from app.clients.menu_service import get_menu_by_id
from app.rules.recommend import recommend_dish
from app.logging import logger

app = FastAPI(title="Dish Recommendation Service")


@app.get("/")
async def get_recommendations(
    menu_id: int = Query(..., description="Menu ID to get recommendation for"),
    user_id: int = Depends(get_current_user),
    token: str = Depends(get_token)
):
    logger.info("Start recommendation", extra={"user_id": user_id, "menu_id": menu_id})

    liked = await get_liked_dishes(user_id)
    menu = await get_menu_by_id(menu_id, token)

    # For a single menu item, create a list with just that dish
    available = [{
        "id": menu["dish_id"],
        "dish_category": menu["dish_category"],
        "dish_name": menu["dish_name"],
    }]
    dish_id = recommend_dish(liked, available)

    if not dish_id:
        raise HTTPException(404, "No recommendation possible")

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO recommendations (user_id, menu_id, dish_id )
                VALUES (%s, %s, %s)
                """,
                (user_id, menu["id"], dish_id),
            )
        conn.commit()
    finally:
        conn.close()

    logger.info(
        "Recommendation saved",
        extra={
            "user_id": user_id,
            "menu_id": menu["id"],
            "dish_id": dish_id,
        },
    )

    return {
        "user_id": user_id,
        "menu_id": menu["id"],
        "dish_id": dish_id,
        "menu": menu,
        "date": date.today(),
    }
