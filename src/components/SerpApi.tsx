import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SerpApi = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://serpapi.com/search.json?q=${query}&api_key=YOUR_API_KEY`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error fetching SERP API:', error);
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>SERP API Search</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="text"
            placeholder="Search query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>
        {results && (
          <pre className="mt-4">{JSON.stringify(results, null, 2)}</pre>
        )}
      </CardContent>
    </Card>
  );
};

export default SerpApi;
