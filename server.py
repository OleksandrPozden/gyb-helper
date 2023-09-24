from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
from datetime import datetime
from flask_caching import Cache


app = Flask(__name__)
CORS(app)

cache = Cache(app, config={'CACHE_TYPE': 'simple', 'CACHE_DEFAULT_TIMEOUT': 31536000})  # 31536000 seconds = 1 year


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
@cache.cached() 
def check_url():
    data = request.get_json()
    url = data.get("url")
    if not url:
        return jsonify({"error": "Missing 'param' in request body"}), 400
    r = requests.get(url)
    if "lifetime" in r.text.lower():
        data = {"message": True}
    else:
        data = {"message": False}
    count(data["message"], url)
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)