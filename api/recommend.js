const OpenAI = require('openai');

// Initialize OpenAI with server-side key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple rate limiting storage (in production, use Redis or database)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // Max 10 requests per minute per IP

function checkRateLimit(ip) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(ip) || [];
  
  // Remove old requests outside the window
  const recentRequests = userRequests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return false; // Rate limit exceeded
  }
  
  // Add current request
  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);
  
  return true; // Request allowed
}

function validateRequestBody(body) {
  if (!body) {
    throw new Error('Request body is required');
  }
  
  if (!body.remainingCount || typeof body.remainingCount !== 'number') {
    throw new Error('remainingCount is required and must be a number');
  }
  
  if (!body.systemMessage || typeof body.systemMessage !== 'string') {
    throw new Error('systemMessage is required and must be a string');
  }
  
  if (!body.prompt || typeof body.prompt !== 'string') {
    throw new Error('prompt is required and must be a string');
  }
  
  return true;
}

module.exports = async (req, res) => {
  // Environment guard
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Basic rate limiting
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    if (!checkRateLimit(ip)) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    }
    
    // Validate request body
    validateRequestBody(req.body);
    
    const { remainingCount, systemMessage, prompt, model = "gpt-4-turbo-preview", temperature = 0.7, max_tokens = 4000 } = req.body;
    
    // Validate environment
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }
    
    // Make OpenAI request
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: systemMessage
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature,
      max_tokens,
      seed: Math.floor(Math.random() * 1000000)
    });
    
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }
    
    // Return the content
    return res.status(200).json({ content });
    
  } catch (error) {
    console.error('API Error:', error);
    
    // Return safe error messages
    if (error.message.includes('API key')) {
      return res.status(500).json({ error: 'AI service configuration error' });
    }
    if (error.message.includes('rate limit')) {
      return res.status(429).json({ error: 'Service temporarily unavailable. Please try again later.' });
    }
    if (error.message.includes('quota')) {
      return res.status(503).json({ error: 'Service temporarily unavailable. Please try again later.' });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
};