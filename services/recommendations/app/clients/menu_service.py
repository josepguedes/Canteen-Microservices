import httpx
from fastapi import HTTPException
MENU_SERVICE_URL = "http://menu-service:5002/graphql"
QUERY = """
query Menu($id: Int!) {
  menuById(id: $id) {
    id_menu
    dish_id
    dish_category
    dish_name
    dish_description
    menu_period
    menu_date
  }
}
"""


async def get_menu_by_id(menu_id: int, token: str) -> dict:
    payload = {
        "query": QUERY,
        "variables": {"id": menu_id},
    }
    
    headers = {"Authorization": f"Bearer {token}"}

    async with httpx.AsyncClient(timeout=3) as client:
        resp = await client.post(MENU_SERVICE_URL, json=payload, headers=headers)

    if resp.status_code != 200:
        raise HTTPException(502, f"Menu service error: {resp.status_code}")

    response_data = resp.json()
    
    # Check for GraphQL errors
    if "errors" in response_data:
        errors = response_data["errors"]
        raise HTTPException(502, f"Menu service GraphQL error: {errors}")
    
    menu_item = response_data.get("data", {}).get("menuById")
    if not menu_item:
        raise HTTPException(404, "Menu not found")

    return {
        "id": menu_item["id_menu"],
        "dish_id": menu_item["dish_id"],
        "dish_category": menu_item["dish_category"],
        "dish_name": menu_item["dish_name"],
        "dish_description": menu_item.get("dish_description"),
        "menu_period": menu_item["menu_period"],
        "menu_date": menu_item["menu_date"],
    }
