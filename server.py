from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
from datetime import datetime
import re
from bs4 import BeautifulSoup


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
    pro_yearly = re.compile(r'<h5>.*?pro module.*?year.*?</h5>', re.DOTALL)
    if "lifetime" in text:
        return "LIFETIME"
    if pro_yearly.search(text):
        return "PRO_YEARLY"
    if "year" in text:
        return "YEARLY"
    if "month" in text:
        return "MONTHLY"
    if "ライフタイムライセンス" in text:
        return "JP-LIFETIME"
    return "NOTHING"

def get_user_info(text):
    result = {}
    soup = BeautifulSoup(text, "lxml")
    table = soup.find('table', class_="Webgood-Billing")
    address_th_tag = table.find('th', string="Address:") if table else None
    if address_th_tag:
        address_td_tag = address_th_tag.find_next_sibling('td')
        result["address"] = address_td_tag.get_text().strip() if address_td_tag else ""
    email_th_tag = table.find('th', string="Email:") if table else None
    if email_th_tag:
        email_td_tag = email_th_tag.find_next_sibling('td')
        result["customer_email"] = email_td_tag.get_text().strip() if email_td_tag else ""
    order_id_th_tag = table.find('th', string="Order ID:") if table else None
    if order_id_th_tag:
        order_id_td_tag = order_id_th_tag.find_next_sibling('td')
        result["order_id"] = order_id_td_tag.get_text().strip() if order_id_td_tag else ""
    return result

def remove_link_and_script_tags(content):
    content = content.lower()
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
    user_info = get_user_info(r.text)
    data = {
        "message": get_subscription(remove_link_and_script_tags(r.text)),
        "customer_email": user_info.get("customer_email", ""),
        "address": user_info.get("address", ""),
        "order_id": user_info.get("order_id", "")
    }
    cache[url] = data
    count(data["message"], url)
    return jsonify(data)

@app.route('/v1', methods=["POST"])
def check_url_v1():
    data = {
        "response": "ok"
    }
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)