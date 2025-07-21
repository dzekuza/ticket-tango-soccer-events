import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { v4 as uuidv4 } from 'uuid';

const ApiKeyGenerator = () => {
  const [apiKey, setApiKey] = useState('');

  const generateApiKey = () => {
    setApiKey(uuidv4());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Key Generator</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={generateApiKey}>Generate API Key</Button>
        {apiKey && (
          <div className="mt-4">
            <p>Your new API key:</p>
            <pre className="p-2 bg-gray-100 rounded-md">{apiKey}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApiKeyGenerator;
