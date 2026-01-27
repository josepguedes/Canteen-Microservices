from datetime import date
from typing import Dict, Any
from fastapi import FastAPI, Depends, Query, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.openapi.utils import get_openapi
from pydantic import BaseModel, Field

from app.auth import get_current_user, get_token
from app.db import get_connection
from app.clients.users_service import get_liked_dishes
from app.clients.menu_service import get_menu_by_id
from app.rules.recommend import recommend_dish
from app.logging import logger


# Pydantic models for request/response schemas
class MenuDetails(BaseModel):
    id: int = Field(..., example=5, description="Menu ID")
    dish_id: int = Field(..., example=12, description="Dish ID")
    dish_category: str = Field(..., example="main", description="Dish category (appetizer, main, dessert, beverage)")
    dish_name: str = Field(..., example="Grilled Chicken", description="Name of the dish")
    menu_date: str = Field(..., example="2026-01-27", description="Menu date (YYYY-MM-DD)")
    menu_period: str = Field(..., example="lunch", description="Meal period (breakfast, lunch, dinner)")
    start_time: str = Field(..., example="12:00:00", description="Start time of meal period")
    end_time: str = Field(..., example="14:00:00", description="End time of meal period")


class RecommendationResponse(BaseModel):
    user_id: int = Field(..., example=1, description="User ID")
    menu_id: int = Field(..., example=5, description="Menu ID")
    dish_id: int = Field(..., example=12, description="Recommended dish ID")
    menu: MenuDetails = Field(..., description="Complete menu details")
    date: str = Field(..., example="2026-01-27", description="Recommendation date")

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": 1,
                "menu_id": 5,
                "dish_id": 12,
                "menu": {
                    "id": 5,
                    "dish_id": 12,
                    "dish_category": "main",
                    "dish_name": "Grilled Chicken",
                    "menu_date": "2026-01-27",
                    "menu_period": "lunch",
                    "start_time": "12:00:00",
                    "end_time": "14:00:00"
                },
                "date": "2026-01-27"
            }
        }


class HealthResponse(BaseModel):
    status: str = Field(..., example="healthy", description="Service health status")
    service: str = Field(..., example="recommendations", description="Service name")


class ErrorResponse(BaseModel):
    detail: str = Field(..., example="Error message", description="Error description")


app = FastAPI(
    title="Dish Recommendation Service API",
    description="""
    ## 🍽️ Canteen Dish Recommendation Service
    
    This microservice provides **personalized dish recommendations** based on user preferences and historical data.
    
    ### 🌟 Features
    
    * **Personalized Recommendations**: AI-powered analysis of user's liked dishes
    * **Menu Integration**: Real-time menu data from Menu Service
    * **User Preferences**: Integration with Users Service for preference retrieval
    * **History Tracking**: All recommendations stored in database for analytics
    * **Smart Algorithm**: Considers dish categories, user preferences, and availability
    
    ### 🔐 Authentication
    
    All endpoints require **JWT authentication**. Include the token in the Authorization header:
    
    ```
    Authorization: Bearer <your-jwt-token>
    ```
    
    **How to get a token:**
    1. Register/Login at Users Service: `POST http://localhost:5000/users/login`
    2. Copy the token from the response
    3. Click the 🔒 **Authorize** button below and paste your token
    
    ### 🎯 Business Logic
    
    The recommendation engine analyzes:
    - ✅ User's previously liked dishes
    - ✅ Dish categories and preferences
    - ✅ Available menu items for the requested date
    - ✅ Similarity scoring between dishes
    - ✅ Popularity metrics
    
    ### 📊 Endpoints Overview
    
    | Endpoint | Method | Description | Auth Required |
    |----------|--------|-------------|---------------|
    | `/recommendations` | GET | Get personalized recommendation | ✅ Yes |
    | `/health` | GET | Service health check | ❌ No |
    """,
    version="1.0.0",
    contact={
        "name": "Canteen Microservices Team",
        "url": "http://localhost:5003",
        "email": "support@canteen.local"
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
    servers=[
        {
            "url": "http://localhost:5003",
            "description": "Development server"
        }
    ],
    tags_metadata=[
        {
            "name": "Recommendations",
            "description": "Personalized dish recommendation operations. **Authentication required**.",
        },
        {
            "name": "Health",
            "description": "Service health and status monitoring. No authentication required.",
        },
    ],
)


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    
    # Add security scheme
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "Enter your JWT token in the format: Bearer {token}"
        }
    }
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi


@app.get(
    "/",
    include_in_schema=False,
    summary="Root redirect"
)
async def root():
    """Redirect root to API documentation (Swagger UI)"""
    return RedirectResponse(url="/docs")


@app.get(
    "/recommendations",
    summary="Get Personalized Dish Recommendation",
    description="""
    ## Get a personalized dish recommendation for a specific menu
    
    This endpoint analyzes your food preferences and returns a tailored dish recommendation.
    
    ### 📋 Process Flow:
    
    1. **Authenticate User** - Validates your JWT token
    2. **Fetch User Preferences** - Retrieves your liked dishes from Users Service
    3. **Get Menu Details** - Fetches menu information from Menu Service
    4. **Apply AI Algorithm** - Analyzes preferences vs available dishes
    5. **Store Recommendation** - Saves the recommendation to database
    6. **Return Result** - Provides complete recommendation with menu details
    
    ### ✅ Requirements:
    
    - **Authentication**: Valid JWT token (click 🔒 Authorize button)
    - **Menu ID**: Must exist in the Menu Service
    - **Available Dishes**: At least one dish must be in the menu
    
    ### 🎯 Algorithm Details:
    
    The recommendation system uses intelligent matching:
    - **Category Matching**: Prioritizes dishes in categories you've liked
    - **Similarity Scoring**: Compares dish attributes with your history
    - **Freshness Factor**: Considers recent preferences more heavily
    - **Availability Check**: Only recommends currently available dishes
    
    ### 📊 Example Usage:
    
    ```bash
    curl -X GET "http://localhost:5003/recommendations?menu_id=5" \\
         -H "Authorization: Bearer YOUR_JWT_TOKEN"
    ```
    """,
    response_description="Personalized dish recommendation with complete menu details",
    response_model=RecommendationResponse,
    tags=["Recommendations"],
    responses={
        200: {
            "description": "✅ Recommendation successfully generated",
            "model": RecommendationResponse,
            "content": {
                "application/json": {
                    "example": {
                        "user_id": 1,
                        "menu_id": 5,
                        "dish_id": 12,
                        "menu": {
                            "id": 5,
                            "dish_id": 12,
                            "dish_category": "main",
                            "dish_name": "Grilled Chicken",
                            "menu_date": "2026-01-27",
                            "menu_period": "lunch",
                            "start_time": "12:00:00",
                            "end_time": "14:00:00"
                        },
                        "date": "2026-01-27"
                    }
                }
            }
        },
        401: {
            "description": "🔒 Unauthorized - Invalid or missing JWT token",
            "model": ErrorResponse,
            "content": {
                "application/json": {
                    "example": {"detail": "Could not validate credentials"}
                }
            }
        },
        404: {
            "description": "❌ Not Found - Menu doesn't exist or no suitable recommendation",
            "model": ErrorResponse,
            "content": {
                "application/json": {
                    "example": {"detail": "No recommendation possible"}
                }
            }
        },
        500: {
            "description": "⚠️ Internal Server Error",
            "model": ErrorResponse,
            "content": {
                "application/json": {
                    "example": {"detail": "Error generating recommendation"}
                }
            }
        }
    }
)
async def get_recommendations(
    menu_id: int = Query(
        ..., 
        description="**Menu ID** to get recommendation for. Must be a valid menu ID from the Menu Service.",
        example=5,
        gt=0,
        title="Menu ID",
        alias="menu_id"
    ),
    user_id: int = Depends(get_current_user),
    token: str = Depends(get_token)
) -> Dict[str, Any]:
    """
    Generate a personalized dish recommendation for the specified menu.
    
    The endpoint requires authentication and will:
    1. Fetch user's dish preferences from the Users Service
    2. Retrieve menu details from the Menu Service
    3. Apply recommendation algorithm
    4. Store and return the recommendation
    """
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


@app.get(
    "/health",
    summary="Service Health Check",
    description="""
    ## Check if the Recommendations service is running and healthy
    
    This endpoint provides a simple health check to verify the service is operational.
    
    **No authentication required** - Public endpoint for monitoring.
    
    ### Usage:
    
    ```bash
    curl http://localhost:5003/health
    ```
    
    ### Response:
    Returns service status and name for monitoring systems.
    """,
    response_model=HealthResponse,
    tags=["Health"],
    responses={
        200: {
            "description": "✅ Service is healthy and operational",
            "model": HealthResponse,
            "content": {
                "application/json": {
                    "example": {"status": "healthy", "service": "recommendations"}
                }
            }
        }
    }
)
async def health_check() -> HealthResponse:
    """
    Simple health check endpoint for monitoring.
    
    Returns service status without requiring authentication.
    """
    return HealthResponse(status="healthy", service="recommendations")

