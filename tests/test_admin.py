from unittest.mock import MagicMock, patch


def test_admin_sees_all_subscriptions(client, admin_auth_headers):
    with patch("backend.app.supabase") as mock, patch("backend.app.decrypt", side_effect=lambda x: x):
        mock.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = MagicMock(
            data={"id": 1, "role": "admin"}
        )
        mock.table.return_value.select.return_value.execute.return_value = MagicMock(
            data=[
                {
                    "id": 1,
                    "user_id": 1,
                    "first_name": "Test",
                    "last_name": "User",
                    "phone": "1234567890",
                    "delivery_address": "Test Address",
                    "bouquet": "S",
                    "period": "weekly",
                    "next_delivery_date": "2026-04-28",
                }
            ]
        )

        response = client.get("/api/subscriptions", headers=admin_auth_headers)

        assert response.status_code == 200
        data = response.get_json()
        assert "subscriptions" in data
        assert data["role"] == "admin"


def test_admin_access_requires_auth(client):
    response = client.get("/api/subscriptions")
    assert response.status_code == 401
