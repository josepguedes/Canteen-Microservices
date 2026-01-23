import httpx
from fastapi import HTTPException
MENU_SERVICE_URL = "http://menu-service:5002/graphql"
QUERY = """
query Menu($mealType: String!) {
  todayMenu(mealType: $mealType) {
    id_menu
    dish_id
    dish_category
    dish_name
    dish_description
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

    menu_items = resp.json()["data"]["todayMenu"]
    if not menu_items:
        raise HTTPException(404, "No menu available today")

    return {
        "id": menu_items[0]["id_menu"] if menu_items else None,
        "dishes": [
            {
                "id": item["dish_id"],
                "dish_category": item["dish_category"],
                "dish_name": item["dish_name"],
            }
            for item in menu_items
        ],
    }
