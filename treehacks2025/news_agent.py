import os
import asyncio
from datetime import datetime
from openai import OpenAI
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import json

class NewsArticle(BaseModel):
    title: str
    content: str
    source: str = "Perplexity AI"
    url: str = ""
    published_at: datetime
    relevance_score: Optional[int] = 0
    category: Optional[str] = "maritime"

app = FastAPI()

class NewsAgent:
    def __init__(self):
        self.api_key = os.getenv("PERPLEXITY_API_KEY")
        self.client = OpenAI(
            api_key=self.api_key,
            base_url="https://api.perplexity.ai"
        )
        self.cached_news = []
        self.last_update = None

    async def fetch_news(self, query: str) -> List[NewsArticle]:
        """Fetch news using Perplexity Sonar API"""
        try:
            messages = [
                {
                    "role": "system",
                    "content": (
                        "You are a maritime news expert. Provide the latest maritime news "
                        "in a clear, structured format. For each news item, include a title "
                        "and detailed content. Focus on factual reporting."
                    )
                },
                {
                    "role": "user",
                    "content": f"What are the latest news updates about {query}? "
                    "Return 3 most relevant news items in this exact format for each item: "
                    "TITLE: [news title] \\n CONTENT: [detailed content]"
                }
            ]

            response = self.client.chat.completions.create(
                model="sonar-pro",
                messages=messages,
            )
            
            content = response.choices[0].message.content
            news_items = content.split("TITLE:")
            
            articles = []
            for item in news_items[1:]:  # Skip first empty split
                try:
                    title_part, content_part = item.split("CONTENT:")
                    title = title_part.strip()
                    content = content_part.strip()
                    
                    articles.append(NewsArticle(
                        title=title,
                        content=content,
                        published_at=datetime.utcnow(),
                        category="maritime"
                    ))
                except Exception as e:
                    print(f"Error parsing news item: {e}")
                    continue
                    
            return articles
            
        except Exception as e:
            print(f"Error fetching news: {e}")
            return []

    async def update_news_cache(self):
        """Update news cache with latest articles"""
        maritime_queries = [
            "maritime shipping industry updates",
            "global maritime trade news",
            "maritime technology and innovation",
            "maritime safety and regulations",
            "maritime environmental impact"
        ]
        
        all_articles = []
        for query in maritime_queries:
            articles = await self.fetch_news(query)
            all_articles.extend(articles)
        
        # Remove duplicates based on title
        self.cached_news = sorted(
            {article.title: article for article in all_articles}.values(),
            key=lambda x: x.published_at,
            reverse=True
        )
        self.last_update = datetime.utcnow()

    async def get_news(self, limit: int = 10) -> List[NewsArticle]:
        """Get news articles, updating cache if necessary"""
        # Update cache if it's empty or older than 30 minutes
        if (not self.cached_news or 
            not self.last_update or 
            (datetime.utcnow() - self.last_update).seconds > 1800):
            await self.update_news_cache()
        
        return self.cached_news[:limit]

# Initialize news agent
news_agent = NewsAgent()

@app.get("/api/news")
async def get_news(limit: int = 10):
    """Get latest news articles"""
    try:
        news = await news_agent.get_news(limit)
        return news
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
