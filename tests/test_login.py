from unittest.mock import MagicMock, patch


def test_successful_login(client):
    with patch("backend.app.supabase") as mock:
        mock.auth.sign_in_with_password.return_value = MagicMock(session=MagicMock(), user=MagicMock())                                                                                                                                   
        mock.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = MagicMock(data={"id": 1, "first_name": "Test", "last_name": "User", "role": "user"})
        response = client.post(
        "/api/login", json={"email": "new@example.com", "password": "testpassword"}
    )

        assert response.status_code== 200
        data = response.get_json()
        assert "access_token" in data
       

def test_login_wrong_credentials(client):
    with patch("backend.app.supabase") as mock:
        mock.auth.sign_in_with_password.side_effect = Exception("Invalid login credentials")
        response = client.post(
            "/api/login", json={"email": "new@example.com", "password": "testpassword"}
        )
    assert response.status_code == 401
    data = response.get_json()
    assert data["error"] == "Invalid login credentials"


