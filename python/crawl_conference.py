import requests
from bs4 import BeautifulSoup
import psycopg2
import json

# Function to fetch topics from the database
def fetch_topics():
    conn = psycopg2.connect(
        dbname="conferenceDB",
        user="postgres",
        password="090899",
        host="localhost",
        port="5433"
    )
    cur = conn.cursor()
    cur.execute("SELECT id, name, url FROM topics")  
    topics = cur.fetchall()
    cur.close()
    conn.close()
    return topics

# Function to scrape data from the provided URL
def scrape_data(url, topic_id):
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    conference_data = []

    # Scraping the data
    for conference_item in soup.find_all('div', class_='row columns is-mobile'):
        conference_details = {}

        # Tìm thẻ <script> chứa JSON-LD
        script_tag = conference_item.find('script', type='application/ld+json')
        if script_tag:
            json_data = json.loads(script_tag.string)
            conference_details['name'] = json_data.get('name', 'N/A')
            conference_details['startDate'] = json_data.get('startDate', 'N/A')
            conference_details['url'] = json_data.get('url', 'N/A')
        else:
            conference_details['name'] = 'N/A'
            conference_details['startDate'] = 'N/A'
            conference_details['url'] = 'N/A'

        # Lấy ngày hội nghị từ thẻ <time>
        time_tag = conference_item.find('time', class_='has-text-weight-bold is-size-7-mobile has-text-grey-dark')
        if time_tag:
            conference_details['date'] = time_tag.get_text(strip=True)
        else:
            conference_details['date'] = 'N/A'

        # Lấy mô tả từ thẻ <h3>
        subtitle_element = conference_item.find('h3', class_='subtitle is-6 is-size-7-mobile')
        if subtitle_element:
            a_tags = subtitle_element.find_all('a')
            if len(a_tags) >= 2:
                conference_details['location'] = a_tags[1].text.strip()
            else:
                conference_details['location'] = 'N/A'
        else:
            conference_details['location'] = 'N/A'

        conference_details['topic_id'] = topic_id  # Include topic ID
        conference_data.append(conference_details)

    return conference_data

# Connect to PostgreSQL
conn = psycopg2.connect(
    dbname="conferenceDB",
    user="postgres",
    password="090899",
    host="localhost",
    port="5433"
)
cur = conn.cursor()

# Create table if not exists
create_table_query = '''
CREATE TABLE IF NOT EXISTS conferences (
    id SERIAL PRIMARY KEY,
    name TEXT,
    start_date TEXT,
    url TEXT,
    date TEXT,
    location TEXT,
    topic_id INTEGER
);
'''
cur.execute(create_table_query)
conn.commit()

# Insert data into the table
insert_query = '''
INSERT INTO conferences (name, start_date, url, date, location, topic_id)
VALUES (%s, %s, %s, %s, %s, %s);
'''

# Fetch topics from the database
topics = fetch_topics()

# Loop through each topic
for topic_id, topic_name, topic_url in topics:
    # Scrape data from the URL
    conference_data = scrape_data(topic_url, topic_id)
    # Insert data into the table
    for conference in conference_data:
        # Insert conference data into conferences table
        cur.execute(insert_query, (
            conference['name'],
            conference['startDate'],
            conference['url'],
            conference['date'],
            conference['location'],
            conference['topic_id'] 
        ))
    conn.commit()

# Close the cursor and connection
cur.close()
conn.close()

print("Data inserted successfully.")
