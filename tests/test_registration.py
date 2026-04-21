from unittest.mock import MagicMock, patch


def test_successful_registration(client):
    with patch("backend.app.supabase") as mock:
        mock.auth.sign_up.return_value = MagicMock(user=MagicMock(id="uuid-123"))                                                                                                                                   
        mock.table.return_value.insert.return_value.execute.return_value = MagicMock(data=[{}])
        response = client.post(
        "/api/register", json={"email": "new@example.com", "password": "testpassword"}
    )
   
    assert response.status_code== 201



def test_registration_missing_email(client):

    response = client.post(
        "/api/register", json={ "password": "testpassword"}
    )
    assert response.status_code== 400
    data =response.get_json()
    assert data["error"] == "Email ja parool on kohustuslik"


def test_registration_duplicate_email(client):
    with patch("backend.app.supabase") as mock:
        mock.auth.sign_up.side_effect = Exception("User already registered")                                                                                                                                  
        
        response = client.post(
        "/api/register", json={"email": "new@example.com", "password": "testpassword"})
        assert response.status_code== 400
        
