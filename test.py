from bs4 import BeautifulSoup
from country_list import countries_for_language


TEST_DATA_DIR = 'test_pages/test.html'

with open(TEST_DATA_DIR, 'r') as f:
    soup = BeautifulSoup(f.read(), 'lxml')

number_of_rows = len(soup.select(".css-14wsju2"))

def test_number_of_visits_selector():
    number_of_visits = soup.select(".css-1eh3oew .css-plwatf")
    assert number_of_rows == len(number_of_visits)
    for tag in number_of_visits:
        assert tag.name == 'div', f"Tag name is not 'div'. Actual tag name: {tag.name}"
        assert isinstance(int(tag.get_text()), int)

def test_country_selector():
    all_countries_names = [name for code, name in countries_for_language('en')]
    countries_tags = soup.select(".css-f2kktt")
    assert number_of_rows == len(countries_tags)
    for country_tag in countries_tags:
        assert country_tag.name == 'span', f"Tag name is not 'div'. Actual tag name: {country_tag.name}"
        print([part.strip() for part in country_tag.get_text().split("\n")])
        assert " ".join([part.strip() for part in country_tag.get_text().split("\n")]) in all_countries_names, f"Country name is not in the list of countries. Actual country name: {country_tag.get_text()}"

def test_button_selector():
    rows = soup.select(".css-14wsju2")
    buttons = []
    for row in rows:
        button = row.select_one(".css-1hb5p1j>div button")
        if button:
            buttons.append(button)
    assert buttons != []
    for button in buttons:
        assert button.get_text().strip().lower() in ["start chat", "supervise chat"]
        assert button.name == 'button', f"Tag name is not 'button'. Actual tag name: {button.name}"

def test_url_selector():
    url_tags = soup.select(".css-1xicsyo")
    assert number_of_rows == len(url_tags)
    for url in url_tags:
        assert url.name == 'a', f"Tag name is not 'a'. Actual tag name: {url.name}"