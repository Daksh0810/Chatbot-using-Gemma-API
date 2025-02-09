from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# Retrieve the API key from environment variable
api_key = os.getenv("API_KEY")

# Make sure the API key is loaded properly
if not api_key:
    raise ValueError("API key is missing. Please set the API_KEY environment variable.")

client = genai.Client(api_key=api_key)

@app.route("/", methods=["GET"])
def home():
    return "Flask Server is Running!", 200

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get("message", "").strip()

        if not user_message:
            return jsonify({"response": "Please enter a message."})

        # Generate AI response using Gemini API
        response = client.models.generate_content(
            model="gemini-2.0-flash", contents=user_message
        )

        ai_response = response.text if response.text else "I'm sorry, I couldn't process that."

        return jsonify({"response": ai_response})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
