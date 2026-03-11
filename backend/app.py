import os
from flask import Flask, request, jsonify, send_from_directory
from flask_jwt_extended import create_access_token, JWTManager, jwt_required, get_jwt_identity
from flask_cors import CORS
from supabase import create_client, Client
from dotenv import load_dotenv

app = Flask(__name__, static_folder="static/dist")
load_dotenv(".env.local")
app.secret_key = os.environ.get("SECRET_KEY")
CORS(app)
jwt = JWTManager(app)
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY")
supabase: Client = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_KEY"))


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
        user_resp = supabase.auth.sign_up({"email": email, "password": password})
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

        user_data_resp = supabase.table("app_users").select("id,first_name,last_name").eq("email", email).single().execute()
        if not user_data_resp.data:
            return jsonify({"error": "Kasutajat ei leitud"}), 404

        user_id = user_data_resp.data["id"]
        first_name = user_data_resp.data["first_name"]
        last_name = user_data_resp.data["last_name"]

    except Exception as e:
        return jsonify({"error": str(e)}), 401

    access_token = create_access_token(identity=email)

    return jsonify({
        "message": "Sisselogimine õnnestus",
        "user_id": user_id,
        "first_name": first_name,
        "last_name": last_name,
        "access_token": access_token,
    }), 200


@app.route("/api/orders", methods=["POST"])
@jwt_required()
def create_order():
    user_email = get_jwt_identity()
    data = request.get_json()

    required_fields = ["first_name", "last_name", "phone", "delivery_address", "bouquet", "period"]
    for f in required_fields:
        if f not in data:
            return jsonify({"error": f"{f} on kohustuslik"}), 400

    # Leia kasutaja Supabase-st
    user_resp = supabase.table("app_users").select("id").eq("email", user_email).single().execute()
    if not user_resp.data:
        return jsonify({"error": "Kasutajat ei leitud"}), 404

    user_id = user_resp.data["id"]

    # Loo tellimuse payload
    order_payload = {
        "user_id": user_id,
        "first_name": data["first_name"],
        "last_name": data["last_name"],
        "phone": data["phone"],
        "delivery_address": data["delivery_address"],
        "bouquet": data["bouquet"],
        "period": data["period"],
    }

    order_resp = supabase.table("orders").insert(order_payload).execute()
    if not order_resp.data:
        return jsonify({"error": "Tellimuse salvestamine ebaõnnestus"}), 500

    order_id = order_resp.data[0]["id"]

    # Lisa eripäevad, kui on
    special_dates_values = data.get("special_dates", [])
    for sd_value in special_dates_values:
        # leia special_dates id
        sd_resp = supabase.table("special_dates").select("id").eq("value", sd_value).single().execute()
        if sd_resp.data:
            supabase.table("order_special_dates").insert({
                "order_id": order_id,
                "special_date_id": sd_resp.data["id"]
            }).execute()

    return jsonify({"message": "Tellimus edukalt salvestatud", "order_id": order_id}), 201


# Serve React
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)