import httpx
from fastapi import HTTPException
from app.config import MENU_SERVICE_URL

QUERY = """
query Menu($mealType: String!) {
  todayMenu(mealType: $mealType) {
    id
    dishes { id }
  }
}
"""


async def get_today_menu(meal_type: str) -> dict:
    payload = {
        "query": QUERY,
        "variables": {"mealType": meal_type},
    }

    async with httpx.AsyncClient(timeout=3) as client:
        resp = await client.post(MENU_SERVICE_URL, json=payload)

    if resp.status_code != 200:
        raise HTTPException(502, "Menu service error")

    menu = resp.json()["data"]["todayMenu"]
    if not menu:
        raise HTTPException(404, "No menu available today")

    return menu
