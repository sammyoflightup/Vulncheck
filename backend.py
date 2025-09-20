from flask import Flask, request, jsonify, send_from_directory
import os
import random
from dotenv import load_dotenv
import requests

load_dotenv()

MORPHEUS_API_KEY = os.getenv("MORPHEUS_API_KEY")
MORPHEUS_API_URL = "https://openbeta.mor.org/api/v1/inference"  # Check Morpheus docs
DEMO_MODE = True  # <---- Switch to False for real API

app = Flask(__name__)

# Serve HTML files
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/signup.html')
def signup_page():
    return send_from_directory('.', 'signup.html')

@app.route('/login.html')
def login_page():
    return send_from_directory('.', 'login.html')

@app.route('/dashboard.html')
def dashboard_page():
    return send_from_directory('.', 'dashboard.html')

# Dummy user storage
users = {}

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data['email']
    if email in users:
        return jsonify({"success": False, "message": "User already exists"})
    users[email] = data
    return jsonify({"success": True})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data['email']
    password = data['password']
    if email in users and users[email]['password'] == password:
        return jsonify({"success": True})
    return jsonify({"success": False, "message": "Invalid credentials"})

@app.route('/api/scan', methods=['POST'])
def scan():
    data = request.get_json()
    code = data.get('contract_code')

    if not code:
        return jsonify({"error": "No contract code provided"}), 400

    if DEMO_MODE:
        # DEMO mode: generate fake security score and fixes
        score = random.randint(40, 100)
        issues = [
            "Reentrancy risk",
            "Integer overflow/underflow",
            "Unchecked external call",
            "Missing access control",
            "Uninitialized storage variable"
        ]
        selected_issues = random.sample(issues, random.randint(0, len(issues)))
        return jsonify({
            "security_score": score,
            "vulnerabilities": selected_issues,
            "suggested_fixes": [f"Fix: {issue}" for issue in selected_issues]
        })
    else:
        # REAL Morpheus API
        headers = {
            "Authorization": f"Bearer {MORPHEUS_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "smart-contract-vulnerability-checker",
            "input": code
        }
        try:
            response = requests.post(MORPHEUS_API_URL, headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()
            return jsonify(result)
        except requests.exceptions.RequestException as e:
            return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
