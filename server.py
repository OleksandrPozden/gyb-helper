from flask import Flask, jsonify, request
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

@app.route('/', methods=["POST"])
def hello_world():
    data = request.get_json()
    url = data.get("url")
    if not url:
        return jsonify({"error": "Missing 'param' in request body"}), 400
    r = requests.get(url)
    if "lifetime" in r.text.lower():
        data = {"message": True}
    else:
        data = {"message": False}
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)