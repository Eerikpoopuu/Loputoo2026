import os
import json
from flask import Flask, request, jsonify, send_from_directory, redirect, session, url_for
from flask_jwt_extended import create_access_token, JWTManager, jwt_required, get_jwt_identity
from flask_cors import CORS
from supabase import create_client, Client
from dotenv import load_dotenv
import stripe
from datetime import datetime, timezone, timedelta
from cryptography.fernet import Fernet

app = Flask(__name__, static_folder="static/dist")
load_dotenv(os.path.join(os.path.dirname(__file__), ".env.local"))
app.secret_key = os.environ.get("SECRET_KEY")
CORS(app)
jwt = JWTManager(app)
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY")
supabase: Client = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_KEY"))
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
encryption_key = os.getenv("ENCRYPTION_KEY")
if not encryption_key:
    raise RuntimeError("ENCRYPTION_KEY is not set in .env.local")
fernet = Fernet(encryption_key)

SPECIAL_DATE_MAP = {
    "valentines": (2, 14),
    "mothers_day": (5, 10),
    "womens_day": (3, 8),
    "christmas": (12, 24),
}


def next_occurrence(month: int, day: int, after: datetime) -> datetime:
    try:
        candidate = after.replace(month=month, day=day, hour=8, minute=0, second=0, microsecond=0)
    except ValueError:
        return after.replace(year=after.year + 1, month=month, day=day, hour=8, minute=0, second=0, microsecond=0)
    if candidate <= after:
        candidate = candidate.replace(year=candidate.year + 1)
    return candidate


def encrypt(value: str) -> str:
    return fernet.encrypt(value.encode()).decode()


def decrypt(value: str) -> str:
    return fernet.decrypt(value.encode()).decode()


@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    first_name = data.get("first_name")
    last_name = data.get("last_name")

    if not email or not password:
        return jsonify({"error": "Email ja parool on kohustuslik"}), 400

    try:
        user_resp = supabase.auth.sign_up({
            "email": email,
            "password": password,
            "options": {"email_redirect_to": os.environ.get("VITE_API_BASE_URL", "http://localhost:8080")},
        })
        auth_user = user_resp.user
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    try:
        supabase.table("app_users").insert({
            "auth_uid": auth_user.id,
            "email": email,
            "first_name": first_name,
            "last_name": last_name,
        }).execute()
    except Exception as e:
        print(f"{e}")
        return jsonify({"error": "App_users insert failed: " + str(e)}), 500

    return jsonify({
        "message": "Kasutaja loodud. Kontrolli oma e-posti!",
        "user_id": auth_user.id,
        "email": email,
        "first_name": first_name,
        "last_name": last_name,
    }), 201


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email ja parool on kohustuslik"}), 400

    try:
        resp = supabase.auth.sign_in_with_password({"email": email, "password": password})
        session = resp.session
        user = resp.user
        if not session or not user:
            return jsonify({"error": "Vale e-post või parool"}), 401

        user_data_resp = supabase.table("app_users").select("id,first_name,last_name,role").eq("email", email).single().execute()
        if not user_data_resp.data:
            return jsonify({"error": "Kasutajat ei leitud"}), 404

        user_id = user_data_resp.data["id"]
        first_name = user_data_resp.data["first_name"]
        last_name = user_data_resp.data["last_name"]
        role = user_data_resp.data["role"]
    except Exception as e:
        return jsonify({"error": str(e)}), 401

    access_token = create_access_token(identity=email)

    return jsonify({
        "message": "Sisselogimine õnnestus",
        "user_id": user_id,
        "first_name": first_name,
        "last_name": last_name,
        "access_token": access_token,
        "role": role,
    }), 200


@app.route("/api/auth/google", methods=["POST"])
def google_auth():
    data = request.get_json()
    email = data.get("email")
    if not email:
        return jsonify({"error": "Email on kohustuslik"}), 400

    auth_uid = data.get("auth_uid")
    first_name = data.get("first_name", "")
    last_name = data.get("last_name", "")

    user_resp = supabase.table("app_users").select("id,role").eq("email", email).execute()
    if not user_resp.data:
        try:
            supabase.table("app_users").insert({
                "email": email,
                "auth_uid": auth_uid,
                "first_name": first_name,
                "last_name": last_name,
            }).execute()
        except Exception as e:
            return jsonify({"error": "App_users insert failed: " + str(e)}), 500
        role = "user"
    else:
        role = user_resp.data[0]["role"]

    access_token = create_access_token(identity=email)
    return jsonify({"access_token": access_token, "role": role}), 200


@app.route("/api/profile", methods=["GET"])
@jwt_required()
def get_profile():
    user_email = get_jwt_identity()
    user_resp = supabase.table("app_users").select("id,first_name,last_name").eq("email", user_email).single().execute()
    if not user_resp.data:
        return jsonify({"error": "Kasutajat ei leitud"}), 404
    return jsonify({"user": user_resp.data}), 200


@app.route("/api/subscriptions", methods=["GET"])
@jwt_required()
def get_subscriptions():
    user_email = get_jwt_identity()
    user_resp = supabase.table("app_users").select("id,role").eq("email", user_email).single().execute()

    if not user_resp.data:
        return jsonify({"error": "Kasutajat ei leitud"}), 404

    user_id = user_resp.data["id"]
    user_role = user_resp.data["role"]

    if user_role == "admin":
        subscriptions_resp = supabase.table("subscriptions").select("id,first_name,last_name,phone,delivery_address,bouquet,period,next_delivery_date,user_id").execute()
    else:
        subscriptions_resp = supabase.table("subscriptions").select("id,first_name,last_name,phone,delivery_address,bouquet,period,next_delivery_date").eq("user_id", user_id).execute()

    decrypted = []
    for s in subscriptions_resp.data:
        s["phone"] = decrypt(s["phone"])
        s["delivery_address"] = decrypt(s["delivery_address"])
        decrypted.append(s)

    return jsonify({"subscriptions": decrypted, "role": user_role}), 200


@app.route("/api/subscriptions/<string:subscription_id>", methods=["DELETE"])
@jwt_required()
def delete_subscription(subscription_id):
    user_email = get_jwt_identity()
    user_resp = supabase.table("app_users").select("id").eq("email", user_email).single().execute()
    if not user_resp.data:
        return jsonify({"error": "Kasutajat ei leitud"}), 404
    user_id = user_resp.data["id"]

    sub_resp = supabase.table("subscriptions").select("stripe_subscription_id").eq("id", subscription_id).eq("user_id", user_id).execute()
    stripe_subscription_id = sub_resp.data[0]["stripe_subscription_id"] if sub_resp.data else None
    if stripe_subscription_id:
        stripe.Subscription.delete(stripe_subscription_id)
    supabase.table("subscriptions").delete().eq("id", subscription_id).eq("user_id", user_id).execute()
    return jsonify({"message": "Tellimus edukalt kustutatud"}), 200


@app.route("/api/stripe-checkout", methods=["POST"])
@jwt_required()
def stripe_checkout():
    user_email = get_jwt_identity()
    data = request.get_json()
    price_id = data.get("priceId")

    if not price_id:
        return jsonify({"error": "Price ID puudub"}), 400

    required_fields = ["first_name", "last_name", "phone", "delivery_address", "bouquet", "period"]
    for f in required_fields:
        if not data.get(f):
            return jsonify({"error": f"{f} on kohustuslik"}), 400

    special_dates = data.get("special_dates", [])
    special_dates_json = json.dumps(special_dates, ensure_ascii=False)

    metadata = {
        "user_email": user_email[:499],
        "first_name": data["first_name"][:499],
        "last_name": data["last_name"][:499],
        "phone": data["phone"][:499],
        "delivery_address": data["delivery_address"][:499],
        "bouquet": data["bouquet"][:499],
        "period": data["period"][:499],
        "special_dates": special_dates_json[:499],
        "price_id": price_id,
        "start_date": data.get("start_date", "")[:499],
    }

    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{"price": price_id, "quantity": 1}],
            mode="subscription",
            subscription_data={},
            success_url=url_for("stripe_success", _external=True) + "?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=url_for("stripe_cancel", _external=True),
            metadata=metadata,
        )
        return jsonify({"url": checkout_session.url})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/success")
def stripe_success():
    session_id = request.args.get("session_id")

    if not session_id:
        return redirect("/?payment=error")

    try:
        checkout_session = stripe.checkout.Session.retrieve(session_id)
    except Exception as e:
        print(f"ERROR: Stripe session retrieve failed: {e}")
        return redirect("/?payment=error")

    if checkout_session.payment_status != "paid":
        print(f"Payment not completed. Status: {checkout_session.payment_status}, session: {session_id}")
        return redirect("/?payment=cancelled")

    meta = checkout_session.metadata or {}
    user_email = meta.get("user_email")

    if not user_email:
        print(f"ERROR: No user_email in metadata for session {session_id}")
        return redirect("/?payment=error")

    try:
        user_resp = supabase.table("app_users").select("id").eq("email", user_email).single().execute()
    except Exception as e:
        print(f"ERROR: Supabase user lookup failed for {user_email}: {e}")
        return redirect("/?payment=error")

    stripe_subscription_id = checkout_session.subscription
    if not stripe_subscription_id:
        print(f"ERROR: No stripe_subscription_id in session {session_id}")
        return redirect("/?payment=error")

    if not user_resp.data:
        print(f"ERROR: User not found in app_users for email {user_email}, session {session_id}")
        return redirect("/?payment=error")

    user_id = user_resp.data["id"]
    now = datetime.now(timezone.utc)
    start_date = now.isoformat()
    next_delivery_date = (now + timedelta(days=7)).isoformat()

    subscription_resp = supabase.table("subscriptions").insert({
        "user_id": user_id,
        "first_name": meta.get("first_name", ""),
        "last_name": meta.get("last_name", ""),
        "phone": encrypt(meta.get("phone", "")),
        "delivery_address": encrypt(meta.get("delivery_address", "")),
        "bouquet": meta.get("bouquet", ""),
        "price": meta.get("price_id", ""),
        "stripe_subscription_id": stripe_subscription_id,
        "stripe_session_id": session_id,
        "start_date": start_date,
        "next_delivery_date": next_delivery_date,
        "period": meta.get("period", ""),
        "special_dates": meta.get("special_dates", "[]"),
    }).execute()

    if not subscription_resp.data:
        return redirect("/?payment=error")

    return redirect("/?payment=success")


@app.route("/api/stripe-webhook", methods=["POST"])
def stripe_webhook():
    event = request.get_json()
    if event["type"] != "invoice.paid":
        return jsonify({"status": "ignored"}), 200

    invoice = event["data"]["object"]
    stripe_subscription_id = invoice.get("subscription")
    cutoff = datetime.fromtimestamp(invoice["lines"]["data"][0]["period"]["end"], tz=timezone.utc)
    paid_at = datetime.fromtimestamp(invoice["status_transitions"]["paid_at"], tz=timezone.utc)

    sub_resp = supabase.table("subscriptions").select("period,special_dates").eq("stripe_subscription_id", stripe_subscription_id).single().execute()
    period = sub_resp.data["period"]
    special_dates = json.loads(sub_resp.data.get("special_dates") or "[]")
    interval = timedelta(days=7) if period == "weekly" else timedelta(days=30)

    next_regular = cutoff if paid_at <= cutoff else cutoff + interval
    candidates = [next_regular]
    for key in special_dates:
        if key in SPECIAL_DATE_MAP:
            m, d = SPECIAL_DATE_MAP[key]
            candidates.append(next_occurrence(m, d, paid_at))
    next_delivery_date = min(candidates)

    supabase.table("subscriptions").update(
        {"next_delivery_date": next_delivery_date.isoformat()}
    ).eq("stripe_subscription_id", stripe_subscription_id).execute()

    return jsonify({"status": "ok"}), 200


@app.route("/cancel")
def stripe_cancel():
    return redirect("/?payment=cancelled")


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
