import requests
from bs4 import BeautifulSoup
import psycopg2

# Function to check if a topic already exists in the database
def topic_exists(cur, name):
    cur.execute("SELECT COUNT(*) FROM topics WHERE name = %s", (name,))
    return cur.fetchone()[0] > 0

# Function to scrape topics from dev.events
def scrape_dev_events_topics():
    url = 'https://dev.events'
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    topic_data = []

    for topic_item in soup.find_all('div', class_='columns is-multiline is-gapless is-size-7-mobile'):
        for topic_link in topic_item.find_all('a', attrs={'hx-boost': True}):
            topic_details = {}
            topic_details['name'] = topic_link.text.strip()
            topic_details['url'] = 'https://dev.events' + topic_link['href']  # Append base URL
            topic_data.append(topic_details)
    
    return topic_data

# Function to scrape topics from Splunk
def scrape_splunk_topics():
    def clean_url(url):
        base_url = 'https://www.splunk.com/'
        if url.startswith('/'):
            url = base_url + url.lstrip('/')
        return url

    url = 'https://www.splunk.com/en_us/blog/learn/it-tech-conferences-events.html'
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')

    dropdowns = soup.find_all('div', class_='dropdown-menu')

    topics = []

    for dropdown in dropdowns:
        links = dropdown.find_all('a', class_='child-list-item')
        for link in links:
            topic = {
                "name": link.text.strip(),
                "url": clean_url(link['href'])
            }
            topics.append(topic)

    return topics

# Connect to PostgreSQL
conn = psycopg2.connect(
        dbname="nmcnpm_project_db",
        user="nmcnpm_project_db",
        password="jcdfpAasXJYTXoLjsbmFTTtde3PJOWWu",
        host="dpg-cpcshrtds78s738sc1cg-a.singapore-postgres.render.com",
        port="5432"
    )
cur = conn.cursor()

# Create table if not exists
create_table_query = '''
CREATE TABLE IF NOT EXISTS topics (
    id SERIAL PRIMARY KEY,
    name TEXT,
    url TEXT
);
'''
cur.execute(create_table_query)
conn.commit()

# Scrape and insert data from dev.events
dev_event_topics = scrape_dev_events_topics()
insert_query = '''
INSERT INTO topics (name, url)
VALUES (%s, %s)
ON CONFLICT DO NOTHING;
'''
for topic in dev_event_topics:
    if not topic_exists(cur, topic['name']):
        cur.execute(insert_query, (topic['name'], topic['url']))
conn.commit()

# Scrape and insert data from Splunk
splunk_topics = scrape_splunk_topics()
for topic in splunk_topics:
    if not topic_exists(cur, topic['name']):
        cur.execute(insert_query, (topic['name'], topic['url']))
conn.commit()

# Close the cursor and connection
cur.close()
conn.close()

print("Data inserted successfully.")
