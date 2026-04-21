import vcr

stripe_vcr = vcr.VCR(
    cassette_library_dir="tests/cassettes",
    record_mode="none",
    filter_headers=["authorization"],
    match_on=["method", "scheme", "host", "port", "path"],
)


def test_successful_checkout_session(client, auth_headers):
    with stripe_vcr.use_cassette("test_successful_checkout_session.yaml"):
        response = client.post(
            "/api/stripe-checkout",
            json={
                "priceId": "price_test123",
                "first_name": "Test",
                "last_name": "User",
                "phone": "1234567890",
                "delivery_address": "Test Address",
                "bouquet": "S",
                "period": "weekly",
            },
            headers=auth_headers,
        )

    assert response.status_code == 200
    data = response.get_json()
    assert "url" in data
    assert "checkout.stripe.com" in data["url"]


def test_checkout_missing_price_id(client, auth_headers):
    response = client.post(
        "/api/stripe-checkout",
        json={
            "first_name": "Test",
            "last_name": "User",
            "phone": "1234567890",
            "delivery_address": "Test Address",
            "bouquet": "S",
            "period": "weekly",
        },
        headers=auth_headers,
    )

    assert response.status_code == 400
    data = response.get_json()
    assert data["error"] == "Price ID puudub"


def test_checkout_requires_auth(client):
    response = client.post(
        "/api/stripe-checkout",
        json={"priceId": "price_test123"},
    )

    assert response.status_code == 401
