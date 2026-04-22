import pytest
from backend.app import app
from flask_jwt_extended import create_access_token
from unittest.mock import MagicMock, patch



def test_profile_requires_auth():
    client = app.test_client()

    response = client.get("/api/profile")

    assert response.status_code == 401


def test_profile_with_auth():
    client = app.test_client()

    with patch("backend.app.supabase") as mock:
        mock.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = MagicMock(
            data={
                "id": 1,
                "first_name": "Test",
                "last_name": "User"
            }
        )
        with app.app_context():
            token = create_access_token(identity="test@example.com")

        response = client.get(
            "/api/profile",
            headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 200

def test_user_sees_orders():
    client = app.test_client()

    with app.app_context():
        token = create_access_token(identity="test@example.com")

    with patch("backend.app.supabase") as mock, patch("backend.app.decrypt", side_effect=lambda x: x):
        mock.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = MagicMock(
            data={"id": 1, "role": "user"}
        )
        mock.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(
            data=[{"id": 1, "first_name": "Test", "last_name": "User",
                   "phone": "1234567890", "delivery_address": "Test Address",
                   "bouquet": "small", "period": "weekly", "next_delivery_date": "2026-04-28"}]
        )

        response = client.get(
            "/api/subscriptions",
            headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 200
        assert "subscriptions" in response.get_json()