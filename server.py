from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
from datetime import datetime
import re


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

def remove_link_and_script_tags(content):
    link_tag = re.compile(r'<link\b[^>]*>.*?</link>', re.DOTALL)
    script_tag = re.compile(r'<script\b[^>]*>.*?</script>', re.DOTALL)
    content = re.sub(script_tag, '', content)
    content = re.sub(link_tag, '', content)
    return content

@app.route('/', methods=['GET'])
def index():
    result = f"total requests: {data['total_requests']}<br>"
    result += "<br>".join([f'{entry[0]} | {entry[1]} | <a href="{entry[2]}" target="_blank">{entry[2]}</a>' for entry in data["data"]])
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
    message = get_subscription(remove_link_and_script_tags(text))
    data = {"message": message}
    cache[url] = data
    count(data["message"], url)
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)