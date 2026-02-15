#!/usr/bin/env node

import https from 'https';

// Test the /api/recommend endpoint
function testRecommendAPI() {
  const postData = JSON.stringify({
    remainingCount: 5,
    systemMessage: "You are a movie recommendation assistant.",
    prompt: "Recommend a good action movie",
    model: "gpt-4o-mini",
    temperature: 0.7,
    max_tokens: 1000
  });

  const options = {
    hostname: 'movie-me-v2.vercel.app',
    port: 443,
    path: '/api/recommend',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = https.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        console.log('Response:', JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log('Raw Response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Request error: ${e.message}`);
  });

  req.write(postData);
  req.end();
}

console.log('Testing /api/recommend endpoint...');
testRecommendAPI();