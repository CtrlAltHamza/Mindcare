import time
import random
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager
from datetime import datetime

# A list of reliable Nitter instances to rotate through
NITTER_INSTANCES = [
    "https://nitter.poast.org",
    "https://nitter.privacydev.net",
    "https://nitter.rawbit.ninja",
    "https://nitter.no-logs.com"
]

def fetch_tweets(username: str, max_tweets: int = 20) -> list[dict]:
    """
    Scrapes tweets from Nitter instances using a headless Chrome browser.
    Rotates through multiple instances if one fails.
    """
    if username.startswith('@'):
        username = username[1:]
        
    print(f"\n🔍 Scraping tweets from X/Twitter for @{username} ...")
    
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--log-level=3')
    options.add_argument('--window-size=1920,1080')
    # Use a real browser user agent to avoid bot detection
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
    
    # Randomly shuffle instances to spread load
    instances = NITTER_INSTANCES.copy()
    random.shuffle(instances)
    
    results = []
    all_tweet_texts = set()
    driver = None
    
    try:
        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
        wait = WebDriverWait(driver, 10)
        
        success = False
        for instance in instances:
            url = f"{instance}/{username}"
            print(f"📡 Trying instance: {instance}...")
            
            try:
                driver.get(url)
                time.sleep(3)
                
                # Check if user exists or page is empty
                body_text = driver.find_element(By.TAG_NAME, "body").text
                if "User not found" in body_text:
                    print(f"❌ User @{username} not found on X.")
                    return []
                
                # Wait for tweets to appear
                wait.until(EC.presence_of_element_located((By.CLASS_NAME, "tweet-content")))
                success = True
                print(f"✅ Connection successful!")
                break
            except Exception as e:
                print(f"⚠️ Instance {instance} failed or timed out. Trying next...")
                continue
                
        if not success:
            print("❌ All Nitter instances failed. Twitter might be temporarily blocking requests.")
            return []
            
        # Scrape Tweets
        while len(results) < max_tweets:
            time.sleep(2)
            tweets = driver.find_elements(By.CLASS_NAME, "timeline-item")
            
            if not tweets:
                break
                
            new_tweets_on_page = 0
            for tweet in tweets:
                try:
                    # Skip 'pinned' or 'retweet' indicators if desired, 
                    # but usually for mental health we want everything.
                    content_elem = tweet.find_element(By.CLASS_NAME, "tweet-content")
                    tweet_text = content_elem.text.strip()
                    
                    if not tweet_text or tweet_text in all_tweet_texts:
                        continue
                        
                    try:
                        date_elem = tweet.find_element(By.CLASS_NAME, "tweet-date")
                        date_str = date_elem.find_element(By.TAG_NAME, "a").get_attribute("title")
                    except:
                        date_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

                    all_tweet_texts.add(tweet_text)
                    results.append({
                        "id": str(len(results) + 1),
                        "body": tweet_text,
                        "created_utc": date_str,
                        "url": driver.current_url
                    })
                    new_tweets_on_page += 1
                    
                    if len(results) >= max_tweets:
                        return results
                        
                except NoSuchElementException:
                    continue
            
            if new_tweets_on_page == 0:
                break
                
            # Scroll and Load More
            try:
                button = driver.find_element(By.CSS_SELECTOR, "div.show-more > a[href*='cursor']")
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", button)
                time.sleep(1)
                driver.execute_script("arguments[0].click();", button)
                time.sleep(3)
            except:
                break
                
    except Exception as e:
        print(f"❌ Scraper Error: {str(e)}")
    finally:
        if driver:
            driver.quit()
            
    return results

if __name__ == "__main__":
    # Test with a known active account
    test_tweets = fetch_tweets("MehwishQamas", max_tweets=5)
    print(f"\n📊 Retrieved {len(test_tweets)} tweets.")
    for t in test_tweets:
        print(f"--- {t['created_utc']} ---\n{t['body'][:100]}...\n")
