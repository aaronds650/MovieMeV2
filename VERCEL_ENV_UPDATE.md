# URGENT: Vercel Environment Variable Update Required

## Problem Confirmed
- `/api/recommend` endpoint returning 500 "AI service configuration error"
- OPENAI_API_KEY environment variable missing or incorrect in Vercel Production

## New API Key
**Located in:** `projects/MovieMeV2/.env` (local file, not committed)
- Key extracted from: UPDATED API KEYS copy.pages  
- Format: sk-proj-[long string]

## Manual Update Steps (Vercel Dashboard)
1. Go to https://vercel.com/dashboard
2. Navigate to MovieMeV2 project 
3. Go to Settings → Environment Variables
4. Find or Add: `OPENAI_API_KEY`
5. Set Value to the key above
6. Set Environment: Production ✅
7. Click Save
8. Trigger redeploy: Deployments → ... → Redeploy

## Verification
After deployment, test with:
```bash
cd projects/MovieMeV2
node test-api.js
```
Should return 200 status with content instead of 500 error.

## Code Verification Complete ✅
- All API files correctly use `process.env.OPENAI_API_KEY`
- No hardcoded keys found in codebase
- No incorrect variable names (OPEN_API_KEY, etc.)
- .env file properly ignored in git
- OpenAI client properly instantiated

## Status
- [x] Problem diagnosed: Environment variable missing
- [x] New API key identified and extracted
- [x] Code audit complete - no issues found
- [ ] **PENDING**: Manual Vercel environment update
- [ ] **PENDING**: Deployment and verification