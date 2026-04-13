"""
Recommendation Service — finds similar/nearby destinations.
Matches by shared tags, budget overlap, and optional geo-proximity.
"""


def get_recommendations(destination_model, current_dest_id: str, limit: int = 5) -> list:
    """
    Get recommended destinations similar to the given one.

    Uses the DestinationModel's built-in get_similar method which
    matches on tags and budget range overlap.

    Args:
        destination_model: DestinationModel instance
        current_dest_id: ID of the current destination
        limit: Max recommendations to return

    Returns:
        List of similar destination dicts
    """
    return destination_model.get_similar(current_dest_id, limit)


def get_personalized_recommendations(destination_model, user_interests: list,
                                      budget: float, limit: int = 5) -> list:
    """
    Get personalized destination recommendations based on user preferences.

    Args:
        destination_model: DestinationModel instance
        user_interests: List of interest tags
        budget: User's budget
        limit: Max recommendations

    Returns:
        List of matching destination dicts
    """
    result = destination_model.get_all(
        page=1, limit=limit, tags=user_interests, budget_max=budget
    )
    return result.get("destinations", [])
