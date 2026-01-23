import httpx
from fastapi import HTTPException

USER_SERVICE_URL = "http://users-service:5000"


async def get_liked_dishes(user_id: int) -> list[int]:
    async with httpx.AsyncClient(timeout=3) as client:
        resp = await client.get(f"{USER_SERVICE_URL}/users/{user_id}/likes")

    if resp.status_code == 404:
        raise HTTPException(404, "User not found")
    if resp.status_code != 200:
        raise HTTPException(502, "User service error")

    data = resp.json()
    liked_dishes = data.get("data", [])
    return [dish["dish_id"] for dish in liked_dishes]
