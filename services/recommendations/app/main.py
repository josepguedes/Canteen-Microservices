from datetime import date
from fastapi import FastAPI, Depends, Query, HTTPException

from app.auth import get_current_user
from app.db import get_connection
from app.clients.user_service import get_liked_dishes
from app.clients.menu_service import get_today_menu
from app.rules.recommend import recommend_dish
from app.logging_config import logger

app = FastAPI(title="Dish Recommendation Service")


@app.get("/recommendations")
async def get_recommendations(
    meal_type: str = Query(..., regex="^(lunch|dinner)$"),
    user_id: int = Depends(get_current_user),
):
    logger.info("Start recommendation", extra={"user_id": user_id})

    liked = await get_liked_dishes(user_id)
    menu = await get_today_menu(meal_type)

    available = menu["dishes"]
    dish_id = recommend_dish(liked, available)

    if not dish_id:
        raise HTTPException(404, "No recommendation possible")

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO recommendations (user_id, menu_id, dish_id, date)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (user_id, date) DO NOTHING
                """,
                (user_id, menu["id"], dish_id, date.today()),
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
        "date": date.today(),
    }
