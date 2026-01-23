import httpx
from fastapi import HTTPException
from app.config import USER_SERVICE_URL


async def get_liked_dishes(user_id: int) -> list[int]:
    async with httpx.AsyncClient(timeout=3) as client:
        resp = await client.get(
            f"{USER_SERVICE_URL}/users/{user_id}/likes"
        )

    if resp.status_code == 404:
        raise HTTPException(404, "User not found")
    if resp.status_code != 200:
        raise HTTPException(502, "User service error")

    return resp.json()["liked_dish_ids"]
