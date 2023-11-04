from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
from datetime import datetime


app = Flask(__name__)
CORS(app)

cache = {}

data = {
    "total_requests": 0,
    "data": []
}
def count(result, url):
    data["total_requests"] += 1
    data["data"].append([
        datetime.now().strftime("%Y-%m-%d_%H-%M"),
        result,
        url
    ])

def get_subscription(text):
    if "lifetime" in text:
        return "LIFETIME"
    if "year" in text:
        return "YEARLY"
    if "month" in text:
        return "MONTHLY"
    return "NOTHING"

@app.route('/', methods=['GET'])
def index():
    result = f"total requests: {data['total_requests']}<br>"
    result += "<br>".join([f"{entry[0]} | {entry[1]} | {entry[2]}" for entry in data["data"]])
    return result

@app.route('/clear', methods=['GET'])
def clear():
    data["data"] = []
    data['total_requests'] = 0
    return 'Cleared'

@app.route('/', methods=["POST"])
def check_url():
    data = request.get_json()
    url = data.get("url")
    if not url:
        return jsonify({"error": "Missing 'param' in request body"}), 400
    if url in cache:
        return jsonify(cache[url])
    r = requests.get(url)
    text = r.text.lower()
    message = get_subscription(text)
    data = {"message": message}
    cache[url] = data
    count(data["message"], url)
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)