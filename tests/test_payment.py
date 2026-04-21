from unittest.mock import MagicMock, patch


def test_successful_stripe_success(client):
    mock_session = MagicMock()
    mock_session.payment_status = "paid"
    mock_session.metadata = {
        "user_email": "test@example.com",
        "first_name": "Test",
        "last_name": "User",
        "phone": "1234567890",
        "delivery_address": "Test Address",
        "bouquet": "S",
        "period": "weekly",
        "price_id": "price_test123",
        "special_dates": "[]",
        "start_date": "",
    }
    mock_session.subscription = "sub_test123"

    with patch("stripe.checkout.Session.retrieve", return_value=mock_session), \
         patch("backend.app.supabase") as mock_supabase, \
         patch("backend.app.encrypt", side_effect=lambda x: x):

        mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = MagicMock(
            data={"id": 1}
        )
        mock_supabase.table.return_value.insert.return_value.execute.return_value = MagicMock(
            data=[{"id": 1}]
        )

        response = client.get("/success?session_id=cs_test_abc123")

    assert response.status_code == 302
    assert "payment=success" in response.location


def test_stripe_success_payment_not_completed(client):
    mock_session = MagicMock()
    mock_session.payment_status = "unpaid"

    with patch("stripe.checkout.Session.retrieve", return_value=mock_session):
        response = client.get("/success?session_id=cs_test_abc123")

    assert response.status_code == 302
    assert "payment=cancelled" in response.location


def test_successful_webhook(client):
    with patch("backend.app.supabase") as mock:
        mock.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = MagicMock(
            data={"period": "weekly"}
        )
        mock.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock(
            data=[{}]
        )

        response = client.post(
            "/api/stripe-webhook",
            json={
                "type": "invoice.paid",
                "data": {
                    "object": {
                        "subscription": "sub_test123",
                        "lines": {
                            "data": [{"period": {"end": 1703086400}}]
                        },
                        "status_transitions": {"paid_at": 1703000000},
                    }
                },
            },
        )

    assert response.status_code == 200
    assert response.get_json()["status"] == "ok"


def test_webhook_non_invoice_event(client):
    response = client.post(
        "/api/stripe-webhook",
        json={"type": "customer.created", "data": {"object": {}}},
    )

    assert response.status_code == 200
    assert response.get_json()["status"] == "ignored"

