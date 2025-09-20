from flask import Flask, request, jsonify, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash
import requests, os
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("MORPHEUS_API_KEY")

app = Flask(__name__, static_folder='../frontend', static_url_path='')

# In-memory user store
users = {}

# Serve static pages
@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/signup.html')
def signup_page():
    return send_from_directory(app.static_folder, 'signup.html')

@app.route('/login.html')
def login_page():
    return send_from_directory(app.static_folder, 'login.html')

@app.route('/dashboard.html')
def dashboard_page():
    return send_from_directory(app.static_folder, 'dashboard.html')

# Signup endpoint
@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    if email in users:
        return jsonify({"success": False, "message": "Email already exists"})
    hashed_pw = generate_password_hash(data.get('password'))
    users[email] = {"name": data.get('name'), "password": hashed_pw}
    return jsonify({"success": True})

# Login endpoint
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    user = users.get(email)
    if user and check_password_hash(user['password'], password):
        return jsonify({"success": True})
    return jsonify({"success": False, "message": "Invalid credentials"})

# Morpheus API scan endpoint
@app.route('/api/scan', methods=['POST'])
def scan_contract():
    code = request.json.get('contract_code')
    if not code:
        return jsonify({"error": "No contract code provided"}), 400

    prompt = f"""
    Analyze this Solidity smart contract for vulnerabilities:
    {code}
    Provide:
    1. List of vulnerabilities
    2. Severity (Low/Medium/High)
    3. Security score (0-100)
    4. Suggestions to fix them
    """
    try:
        response = requests.post(
            "https://api.mor.org/inference",
            headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
            json={"model": "morpheus-chat", "prompt": prompt}
        )
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
