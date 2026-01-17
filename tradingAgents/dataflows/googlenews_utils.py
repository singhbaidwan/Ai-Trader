import requests
from bs4 import BeautifulSoup
from datetime import datetime, timezone
import time
import random
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    retry_if_result,
)
import ipdb; 
from langchain_community.tools import DuckDuckGoSearchRun
from ddgs import DDGS




def is_rate_limited(response):
    """Check if the response indicates rate limiting (HTTP 429)."""
    if response.status_code == 429:
        return True
    return False



@retry(
    retry=(
        retry_if_exception_type(requests.exceptions.RequestException) |
        retry_if_result(is_rate_limited)
    ),
    wait=wait_exponential(multiplier=1, min=4, max=60),
    stop=stop_after_attempt(5),
)
def make_request(url,headers):
    time.sleep(random.uniform(1, 3))  # Random delay between 1 to 3 seconds
    response = requests.get(url, headers=headers)
    response.raise_for_status()  # Raise an error for bad responses
    return response


from ddgs import DDGS
from datetime import datetime, timezone

from langchain_community.tools import DuckDuckGoSearchRun

def getNewsData(query, startDate, endDate, max_results=50):
    """
    Fetch news using DuckDuckGoSearchRun with optional date filtering.

    query: str - search query
    startDate: str - "YYYY-MM-DD"
    endDate: str - "YYYY-MM-DD"
    max_results: int
    """
    # Create a search instance
    search = DuckDuckGoSearchRun()

    # DuckDuckGo accepts `after:` and `before:` operators
    full_query = f"{query} after:{startDate} before:{endDate}"

    # Run the search
    results_text = search.run(full_query)

    # DuckDuckGoSearchRun returns a string; we can split by newline if needed
    # For demo, just wrap into a list of dicts with simple structure
    results = []
    lines = results_text.split("\n")
    for line in lines:
        if line.strip():
            results.append({
                "title": line.strip(),
                "link": None,      # DuckDuckGoSearchRun does not give structured link
                "snippet": None,
                "source": None,
                "time_published": None
            })

    # Limit to max_results
    return results[:max_results]




# if __name__ == "__main__":
    # query = "Artificial Intelligence"
    # start_date = "2025-01-01"
    # end_date = "2025-12-31"
    
    # search = DuckDuckGoSearchRun()

    # query = (
    # "langchain agents tutorial "
    # "after:2024-01-01 before:2024-06-01"
    # )

    # results = search.run(query)
    # print(results)
    # results = getNewsData(
    # query="AI regulation",
    # startDate="2025-12-01",
    # endDate="2025-12-31",
    # max_results=50
    # )
    # print(results)
    # for r in results[:5]:
    #     print(r["title"], r["source"])

