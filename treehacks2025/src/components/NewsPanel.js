import React, { useState, useEffect } from 'react';

const NewsPanel = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('http://localhost:8000/news/api/news?limit=5');
        const data = await response.json();
        setNews(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch news');
        setLoading(false);
      }
    };

    fetchNews();
    // Fetch news every 5 minutes
    const interval = setInterval(fetchNews, 300000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="agent-panel">
        <h6 className="panel-title">Maritime News Feed</h6>
        <div className="panel-content">
          <div className="d-flex justify-content-center align-items-center w-100">
            <div className="spinner-border text-light" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="agent-panel">
        <h6 className="panel-title">Maritime News Feed</h6>
        <div className="panel-content">
          <div className="alert alert-danger">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="agent-panel">
      <h6 className="panel-title">Maritime News Feed</h6>
      <div className="panel-content">
        <div className="news-container">
          {news.map((article) => (
            <div key={article.id} className="news-item">
              <div className="news-header">
                <span className="news-source">{article.source}</span>
                <span className="news-date">{formatDate(article.published_at)}</span>
              </div>
              <h6 className="news-title">{article.title}</h6>
              <p className="news-excerpt">
                {article.content.length > 150 
                  ? `${article.content.substring(0, 150)}...` 
                  : article.content}
              </p>
              <div className="news-footer">
                <span className="news-category">{article.category}</span>
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="news-link"
                >
                  Read More
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsPanel;
