from flask import Blueprint, render_template, request, jsonify, session, redirect, url_for
from .ai_module import get_ai_response
# from google.cloud import firestore

# db = firestore.Client(project="streetconnect-54453")


main_bp = Blueprint('main', __name__)

# ---------------- HOME & AUTH ----------------

@main_bp.route("/")
def home():
    return render_template("login.html")

@main_bp.route("/signup")
def signup():
    return render_template("signup.html")

@main_bp.route("/my-bookings")
def my_bookings():
    return render_template("user_booking.html")
 
@main_bp.route('/profile')
def user_profile():
    # your code
    return render_template('user_profile.html')

@main_bp.route("/my-bookings")
def user_bookings():
    return render_template("user_booking.html")

# Rename any other conflicting route functions, e.g.:

@main_bp.route('/profile/edit')
def user_profile_edit():
    # ...
    pass


@main_bp.route("/chatbot", methods=["POST"])
def chatbot():
    user_msg = request.json.get("message")
    ai_reply = get_ai_response(user_msg)
    return jsonify({"response": ai_reply})


# ---------------- SESSION ROLES ----------------

@main_bp.route("/set-role/<role>")
def set_role(role):
    if role in ["vendor", "supplier"]:
        session["role"] = role
        return jsonify({"status": "success", "role": role})
    return jsonify({"status": "error", "message": "Invalid role"}), 400

@main_bp.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return redirect(url_for("main.home"))





@main_bp.route("/vendor/cart")
def vendor_cart():
    if session.get("role") != "vendor":
        return redirect(url_for("main.home"))
    return render_template("cart.html")

# OWNER DASHBOARDS
@main_bp.route("/owner/dashboard")
def owner_dashboard():
    if session.get("role") != "supplier":
        return redirect(url_for("main.home"))
    return render_template("owner_dashboard.html")
 
@main_bp.route("/user_dashboard")
def user_dashboard():
    if session.get("role") != "vendor":
        return redirect(url_for("main.home"))
    return render_template("user_dashboard.html")

@main_bp.route("/user_cart")
def user_cart():
    return render_template("user_cart.html")




@main_bp.route('/court-details')
def court_details():
    court_data = {
        "name": "Sunset Basketball Court",
        "location": "Downtown City Center",
        "rating": 4.8,
        "reviews_count": 12,
        "description": "A beautiful outdoor basketball court with professional lighting and seating.",
        "amenities": ["Outdoor Seating", "Drinking Water", "Parking", "Washrooms"],
        "pricing": [
            {"day": "Monday - Friday", "time": "6am - 10pm", "price": "₹500/hr"},
            {"day": "Saturday - Sunday", "time": "6am - 10pm", "price": "₹700/hr"}
        ]
    }
    return render_template('court_details.html', court=court_data)  # ✅ Pass `court`


@main_bp.route('/court/<int:court_id>/book')
def court_book(court_id):
    # You can fetch the court info here if needed
    court_data = {
        "id": court_id,
        "name": "Sunset Basketball Court"
    }
    return render_template('court_book.html', court=court_data)
