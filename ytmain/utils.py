import requests
import json
import re
from urllib.parse import quote_plus  # Import for URL encoding

def fetch_youtube_results(query):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36"
    }
    
    # Properly encode the query
    encoded_query = quote_plus(query)
    url = f"https://www.youtube.com/results?search_query={encoded_query}"
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        html_content = response.text
        
        # Extract JSON data from the <script> tag
        json_text = re.search(r'var ytInitialData = ({.*?});', html_content)
        if json_text:
            json_data = json_text.group(1)
            
            # Load JSON data
            try:
                data = json.loads(json_data)
            except json.JSONDecodeError as e:
                print(f"JSON decode error: {e}")
                return []
            
            # Extract video titles, URLs, and thumbnails
            results = []
            
            # Extract from main search results
            for item in data['contents']['twoColumnSearchResultsRenderer']['primaryContents']['sectionListRenderer']['contents']:
                if 'itemSectionRenderer' in item:
                    for video in item['itemSectionRenderer']['contents']:
                        if 'videoRenderer' in video:
                            video_renderer = video['videoRenderer']
                            title = video_renderer['title']['runs'][0]['text']
                            video_id = video_renderer['videoId']
                            url = f"https://www.youtube.com/watch?v={video_id}"
                            thumbnail = video_renderer['thumbnail']['thumbnails'][0]['url']
                            results.append({'title': title, 'link': video_id, 'thumbnail': thumbnail})
            
            # Extract from short video results
            for item in data['contents']['twoColumnSearchResultsRenderer']['primaryContents']['sectionListRenderer']['contents']:
                if 'itemSectionRenderer' in item:
                    for video in item['itemSectionRenderer']['contents']:
                        if 'reelItemRenderer' in video:
                            reel_item_renderer = video['reelItemRenderer']
                            title = reel_item_renderer['headline']['simpleText']
                            video_id = reel_item_renderer['videoId']
                            url = f"https://www.youtube.com/watch?v={video_id}"
                            thumbnail = reel_item_renderer['thumbnail']['thumbnails'][0]['url']
                            results.append({'title': title, 'link': url, 'thumbnail': thumbnail})

            return results
        else:
            print("No JSON data found.")
            return []
    else:
        print(f"Failed to retrieve the page: {response.status_code}")
        return []
