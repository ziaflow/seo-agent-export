# SEO Automation Tools

This directory contains specialized tools for the SEO automation system.

## Tools Overview

### 1. `seoAnalysisTool.ts`
Analyzes websites for on-page, technical, and structural SEO issues. Returns issues categorized by severity with actionable recommendations.

### 2. `analyticsTool.ts`
Legacy analytics tool with simulated data. Use `realAnalyticsTool.ts` for production.

### 3. `realAnalyticsTool.ts` ⚡
**Multi-platform marketing analytics integration**

Fetches data from:
- **Google Analytics 4**: Traffic, engagement, conversions
- **Meta Pixel**: Facebook/Instagram events and conversions  
- **TikTok Pixel**: TikTok campaign performance
- **Microsoft Clarity**: User behavior insights (rage clicks, dead clicks)

**Current Status**: Extensible stub implementation
- ✅ Structure and interfaces ready for production APIs
- ✅ Graceful fallback to mock data when credentials not configured
- ⚠️ OAuth flows and actual HTTP requests need implementation
- ⚠️ Error handling and rate limiting need enhancement

**To add real API calls**:
1. Uncomment the API client imports in each fetch function
2. Implement OAuth 2.0 flows for Meta and TikTok
3. Configure service account for Google Analytics
4. Add proper error handling and retry logic
5. Test with live credentials

**Why extensible stubs?**
- Each marketing platform has complex authentication requirements
- OAuth flows require user-specific setup (redirect URLs, consent screens)
- Service accounts need proper IAM configuration
- Rate limits vary by platform and account tier

The current implementation provides the complete data structure and integration points, making it easy to plug in real API clients when credentials are configured.

### 4. `searchQueryTool.ts`
Identifies keyword opportunities, content gaps, and trending topics based on industry analysis.

### 5. `contentGenerationTool.ts`
Generates SEO-optimized content including blog posts, meta descriptions, and title tags.

## Database Integration

All tools integrate with PostgreSQL storage via `src/mastra/storage/analyticsDb.ts`:
- SEO audits stored with full issue details
- Analytics data persisted for historical tracking
- Content opportunities tracked with status
- Generated content logged with SEO metrics

## Usage in Agent

The SEO Orchestrator Agent (`src/mastra/agents/seoAgent.ts`) has access to all tools and intelligently selects which to use based on the task requirements.

## Testing Tools

You can test individual tools using the Mastra dev server:

```bash
curl -X POST http://localhost:5000/api/tools/seo-analysis \
  -H "Content-Type: application/json" \
  -d '{"websiteUrl": "https://example.com", "analysisType": "all"}'
```

## Future Enhancements

- [ ] Implement real Google Analytics 4 Data API integration
- [ ] Add Meta Conversions API with OAuth 2.0 flow
- [ ] Integrate TikTok Events API
- [ ] Connect Microsoft Clarity API
- [ ] Add Semrush/Ahrefs integration for keyword data
- [ ] Implement Google Search Console integration
- [ ] Add competitive analysis capabilities
