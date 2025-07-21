import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const WebScraper = () => {
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleScrape = async () => {
    setLoading(true);
    try {
      // This is a placeholder for the actual scraping logic,
      // which would be implemented on the backend.
      const response = await fetch(`/api/scrape?url=${encodeURIComponent(url)}`);
      const data = await response.text();
      setContent(data);
    } catch (error) {
      console.error('Error scraping website:', error);
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Web Scraper</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="text"
            placeholder="Enter URL to scrape"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Button onClick={handleScrape} disabled={loading}>
            {loading ? 'Scraping...' : 'Scrape'}
          </Button>
        </div>
        {content && (
          <pre className="mt-4">{content}</pre>
        )}
      </CardContent>
    </Card>
  );
};

export default WebScraper;
