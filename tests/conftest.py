import pytest
from backend.app import app
from flask_jwt_extended import create_access_token


@pytest.fixture
def client():
    app.config["TESTING"] = True
    return app.test_client()


@pytest.fixture
def auth_headers():
    with app.app_context():
        token = create_access_token(identity="test@example.com")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_auth_headers():
    with app.app_context():
        token = create_access_token(identity="admin@example.com")
    return {"Authorization": f"Bearer {token}"}
