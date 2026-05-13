import requests
import json
import csv
import time
from datetime import datetime, timezone

# ─────────────────────────────────────────────
#  CONFIGURATION
# ─────────────────────────────────────────────
TARGET_USER   = "SamiSha_"          # Reddit username (no u/)
MAX_POSTS     = 20             # How many text posts to collect (set to None for max ~1000)
OUTPUT_FORMAT = "json"          # "json" | "csv" | "print"
OUTPUT_FILE   = "reddit_posts"  # Output filename (no extension)
DELAY_SECONDS = 2               # Pause between requests (be polite, avoid blocks)
# ─────────────────────────────────────────────

BASE_URL   = "https://www.reddit.com/user/{}/submitted.json"
HEADERS    = {
    # Reddit blocks generic user-agents; a browser-like string works fine
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    )
}


# ── Helpers ──────────────────────────────────

def is_text_post(post_data: dict) -> bool:
    """Return True only for self (text) posts with real content."""
    if not post_data.get("is_self", False):
        return False
    body = post_data.get("selftext", "").strip()
    if not body or body in ("[removed]", "[deleted]"):
        return False
    return True


def parse_post(post_data: dict) -> dict:
    """Extract the fields we care about from a raw post dict."""
    created = post_data.get("created_utc", 0)
    dt = datetime.fromtimestamp(created, tz=timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    return {
        "id":           post_data.get("id"),
        "title":        post_data.get("title", "").strip(),
        "body":         post_data.get("selftext", "").strip(),
        "subreddit":    post_data.get("subreddit", ""),
        "score":        post_data.get("score", 0),
        "upvote_ratio": post_data.get("upvote_ratio", 0.0),
        "num_comments": post_data.get("num_comments", 0),
        "created_utc":  dt,
        "flair":        post_data.get("link_flair_text") or "",
        "nsfw":         post_data.get("over_18", False),
        "url":          f"https://www.reddit.com{post_data.get('permalink', '')}",
    }


# ── Core fetch logic ──────────────────────────

def fetch_user_text_posts(username: str, max_posts: int | None) -> list[dict]:
    """
    Paginate through a user's submitted posts using the .json endpoint.
    Collects only self (text) posts.
    """
    url      = BASE_URL.format(username)
    after    = None          # pagination cursor
    results  = []
    page     = 0

    print(f"\n🔍 Scraping text posts from u/{username} ...\n")

    while True:
        params = {"limit": 100, "raw_json": 1}
        if after:
            params["after"] = after

        try:
            resp = requests.get(url, headers=HEADERS, params=params, timeout=15)
        except requests.RequestException as e:
            print(f"[ERROR] Request failed: {e}")
            break

        if resp.status_code == 404:
            print(f"[ERROR] User u/{username} not found (404).")
            break
        if resp.status_code == 403:
            print(f"[ERROR] u/{username}'s profile is private or suspended (403).")
            break
        if resp.status_code == 429:
            print("[WARN] Rate limited (429). Waiting 30 seconds ...")
            time.sleep(30)
            continue
        if resp.status_code != 200:
            print(f"[ERROR] Unexpected status {resp.status_code}.")
            break

        data = resp.json()

        try:
            children = data["data"]["children"]
            after    = data["data"].get("after")   # next page cursor
        except KeyError:
            print("[ERROR] Unexpected response structure.")
            break

        if not children:
            print("  → No more posts found.")
            break

        page += 1
        page_hits = 0

        for child in children:
            post_data = child.get("data", {})
            if is_text_post(post_data):
                results.append(parse_post(post_data))
                page_hits += 1
                if max_posts and len(results) >= max_posts:
                    print(f"  Page {page}: +{page_hits} text posts  |  Total: {len(results)}  [limit reached]")
                    return results

        print(f"  Page {page}: +{page_hits} text posts  |  Total: {len(results)}")

        if not after:
            print("  → Reached end of user's post history.")
            break

        time.sleep(DELAY_SECONDS)   # polite delay between pages

    return results


# ── Output helpers ────────────────────────────

def save_json(posts: list[dict], filename: str):
    path = f"{filename}.json"
    with open(path, "w", encoding="utf-8") as f:
        json.dump(posts, f, ensure_ascii=False, indent=2)
    print(f"\n✅ Saved {len(posts)} posts  →  {path}")


def save_csv(posts: list[dict], filename: str):
    if not posts:
        print("⚠️  No posts to save.")
        return
    path = f"{filename}.csv"
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=posts[0].keys())
        writer.writeheader()
        writer.writerows(posts)
    print(f"\n✅ Saved {len(posts)} posts  →  {path}")


def print_posts(posts: list[dict]):
    for i, p in enumerate(posts, 1):
        print(f"\n{'─' * 60}")
        print(f"[{i}] r/{p['subreddit']}  |  {p['created_utc']}  |  ⬆ {p['score']}")
        print(f"Title : {p['title']}")
        body_preview = p["body"][:300] + ("..." if len(p["body"]) > 300 else "")
        print(f"Body  : {body_preview}")
        print(f"Link  : {p['url']}")


# ── Entry point ───────────────────────────────

def main():
    posts = fetch_user_text_posts(TARGET_USER, MAX_POSTS)

    if not posts:
        print(f"\n⚠️  No text posts found for u/{TARGET_USER}.")
        return

    print(f"\n✔  Done. Collected {len(posts)} text post(s).\n")

    if OUTPUT_FORMAT == "json":
        save_json(posts, OUTPUT_FILE)
    elif OUTPUT_FORMAT == "csv":
        save_csv(posts, OUTPUT_FILE)
    elif OUTPUT_FORMAT == "print":
        print_posts(posts)
    else:
        print(f"[ERROR] Unknown OUTPUT_FORMAT '{OUTPUT_FORMAT}'. Use 'json', 'csv', or 'print'.")


if __name__ == "__main__":
    main()