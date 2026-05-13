import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, ElementClickInterceptedException
from webdriver_manager.chrome import ChromeDriverManager
from datetime import datetime

def fetch_tweets(username: str, max_tweets: int = 20) -> list[dict]:
    """
    Scrapes tweets from Nitter (Twitter frontend) using a headless Chrome browser.
    """
    print(f"\n🔍 Scraping tweets from X/Twitter for @{username} ...\n")
    
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--log-level=3')
    
    # Initialize driver
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    wait = WebDriverWait(driver, 10)
    
    # Nitter is an alternative Twitter frontend
    url = f"https://nitter.net/{username}"
    driver.get(url)
    
    time.sleep(2)
    if len(driver.find_elements(By.CLASS_NAME, "tweet-content")) == 0:
        driver.refresh()
        time.sleep(3)
        
    results = []
    all_tweet_texts = set()
    page_num = 1
    max_retries = 3
    
    def safe_refresh():
        driver.refresh()
        time.sleep(3)
        try:
            wait.until(EC.presence_of_element_located((By.CLASS_NAME, "tweet-content")))
        except TimeoutException:
            pass
            
    while True:
        tweets_found = False
        for attempt in range(max_retries):
            try:
                wait.until(EC.presence_of_element_located((By.CLASS_NAME, "tweet-content")))
                tweets_found = True
                break
            except TimeoutException:
                if attempt < max_retries - 1:
                    safe_refresh()
        
        if not tweets_found:
            break
            
        time.sleep(2)
        tweets = driver.find_elements(By.CLASS_NAME, "timeline-item")
        
        new_tweets_found = False
        for tweet in tweets:
            try:
                content_elem = tweet.find_element(By.CLASS_NAME, "tweet-content")
                tweet_text = content_elem.text.strip()
                
                # Try to get date if available, else use current time
                try:
                    date_elem = tweet.find_element(By.CLASS_NAME, "tweet-date")
                    date_str = date_elem.find_element(By.TAG_NAME, "a").get_attribute("title")
                except:
                    date_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

                if tweet_text and tweet_text not in all_tweet_texts:
                    all_tweet_texts.add(tweet_text)
                    results.append({
                        "id": str(len(results) + 1),
                        "body": tweet_text,
                        "created_utc": date_str,
                        "url": url
                    })
                    new_tweets_found = True
                    
                    if len(results) >= max_tweets:
                        driver.quit()
                        return results
            except NoSuchElementException:
                continue
                
        if not new_tweets_found:
            break
            
        # Try to go to next page
        try:
            button = driver.find_element(By.CSS_SELECTOR, "div.show-more > a[href*='cursor']")
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", button)
            time.sleep(1)
            driver.execute_script("arguments[0].click();", button)
            time.sleep(3)
            page_num += 1
        except Exception:
            break
            
    driver.quit()
    return results

if __name__ == "__main__":
    tweets = fetch_tweets("MehwishQamas", max_tweets=5)
    for t in tweets:
        print(t['body'][:50])
