import OpenAI from 'openai';
import { Business, Review, ChatMessage } from '../types';
import { encode } from 'gpt-3-encoder';

// Initialize OpenAI - in production, use environment variables
const openai = new OpenAI({
  apiKey: 'your-api-key-here',
  dangerouslyAllowBrowser: true // Only for demo
});

// Enhanced system prompt with more capabilities
const SYSTEM_PROMPT = `You are an advanced AI assistant for a business directory platform with the following capabilities:

1. Business Analysis & Insights
   - Analyze business performance metrics
   - Identify trends and patterns
   - Provide actionable recommendations
   - Compare businesses within categories

2. Smart Recommendations
   - Personalized business suggestions
   - Category-specific insights
   - Location-aware recommendations
   - Time-sensitive suggestions

3. Review Analysis
   - Sentiment analysis of reviews
   - Key phrase extraction
   - Customer satisfaction metrics
   - Trend identification

4. Business Optimization
   - Profile optimization suggestions
   - Marketing recommendations
   - Operational insights
   - Competitive analysis

5. Location Intelligence
   - Geographic market analysis
   - Demographic insights
   - Foot traffic patterns
   - Expansion recommendations

Guidelines:
- Provide data-driven insights when possible
- Be specific and actionable in recommendations
- Consider local market context
- Focus on practical business value
- Maintain professionalism while being approachable`;

export class AI {
  static async generateStreamingResponse(
    messages: ChatMessage[],
    context: {
      businesses?: Business[];
      reviews?: Review[];
      currentBusiness?: Business;
      userLocation?: { latitude: number; longitude: number };
    } = {}
  ) {
    try {
      // Generate context-enhanced message
      const contextMessage = this.generateContext(messages[messages.length - 1].content, context);
      
      // Prepare messages array with system prompt
      const apiMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.slice(-5).map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content
        })),
        { role: 'user', content: contextMessage }
      ];

      // Create streaming completion
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 0.2,
        presence_penalty: 0.3,
        stream: true
      });

      return completion;
    } catch (error) {
      console.error('AI streaming error:', error);
      throw error;
    }
  }

  static async analyzeBusinessInsights(business: Business): Promise<{
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    recommendations: string[];
  }> {
    try {
      const prompt = `Analyze the following business and provide insights:
      Business Name: ${business.name}
      Category: ${business.category}
      Average Rating: ${business.stats?.averageRating}
      Total Reviews: ${business.stats?.totalReviews}
      Description: ${business.description}
      
      Provide a detailed SWOT analysis and actionable recommendations.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const response = completion.choices[0]?.message?.content || '';
      return this.parseInsightsResponse(response);
    } catch (error) {
      console.error('AI analysis error:', error);
      throw error;
    }
  }

  static async generateBusinessSuggestions(
    userPreferences: string,
    context: {
      location?: { latitude: number; longitude: number };
      timeOfDay?: string;
      businesses?: Business[];
    }
  ): Promise<Business[]> {
    try {
      const prompt = this.generateSuggestionsPrompt(userPreferences, context);
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const response = completion.choices[0]?.message?.content || '';
      return this.parseBusinessSuggestions(response, context.businesses || []);
    } catch (error) {
      console.error('AI suggestions error:', error);
      throw error;
    }
  }

  static async analyzeSentiment(reviews: Review[]): Promise<{
    overall: number;
    aspects: { [key: string]: number };
    keywords: string[];
    summary: string;
  }> {
    try {
      const prompt = `Analyze the sentiment and extract key insights from these reviews:
      ${reviews.map(r => `"${r.content}"`).join('\n')}
      
      Provide:
      1. Overall sentiment score (0-1)
      2. Aspect-based sentiment scores
      3. Key recurring themes/keywords
      4. Brief summary of findings`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      const response = completion.choices[0]?.message?.content || '';
      return this.parseSentimentResponse(response);
    } catch (error) {
      console.error('AI sentiment analysis error:', error);
      throw error;
    }
  }

  private static generateContext(
    message: string,
    context: {
      businesses?: Business[];
      reviews?: Review[];
      currentBusiness?: Business;
      userLocation?: { latitude: number; longitude: number };
    }
  ): string {
    let contextualMessage = message;

    if (context.businesses) {
      contextualMessage += '\n\nRelevant businesses:\n' +
        context.businesses.slice(0, 3).map(b =>
          `- ${b.name} (${b.category}): ${b.description.slice(0, 100)}...`
        ).join('\n');
    }

    if (context.currentBusiness) {
      contextualMessage += `\n\nCurrent business context:\n` +
        `Name: ${context.currentBusiness.name}\n` +
        `Category: ${context.currentBusiness.category}\n` +
        `Rating: ${context.currentBusiness.stats?.averageRating}\n` +
        `Reviews: ${context.currentBusiness.stats?.totalReviews}`;
    }

    if (context.userLocation) {
      contextualMessage += `\n\nUser location: ${context.userLocation.latitude}, ${context.userLocation.longitude}`;
    }

    return contextualMessage;
  }

  private static generateSuggestionsPrompt(
    userPreferences: string,
    context: {
      location?: { latitude: number; longitude: number };
      timeOfDay?: string;
      businesses?: Business[];
    }
  ): string {
    let prompt = `Generate business suggestions based on the following preferences: ${userPreferences}`;

    if (context.location) {
      prompt += `\nUser location: ${context.location.latitude}, ${context.location.longitude}`;
    }

    if (context.timeOfDay) {
      prompt += `\nTime of day: ${context.timeOfDay}`;
    }

    if (context.businesses) {
      prompt += `\n\nAvailable businesses:\n${
        context.businesses.map(b => 
          `- ${b.name} (${b.category}) - Rating: ${b.stats?.averageRating}`
        ).join('\n')
      }`;
    }

    return prompt;
  }

  private static parseInsightsResponse(response: string) {
    // Simple parsing logic - in a real app, use more robust parsing
    const sections = response.split('\n\n');
    return {
      strengths: sections[0]?.split('\n').filter(s => s.startsWith('-')).map(s => s.slice(2)) || [],
      weaknesses: sections[1]?.split('\n').filter(s => s.startsWith('-')).map(s => s.slice(2)) || [],
      opportunities: sections[2]?.split('\n').filter(s => s.startsWith('-')).map(s => s.slice(2)) || [],
      recommendations: sections[3]?.split('\n').filter(s => s.startsWith('-')).map(s => s.slice(2)) || [],
    };
  }

  private static parseBusinessSuggestions(response: string, availableBusinesses: Business[]): Business[] {
    const businessNames = response.split('\n')
      .filter(line => line.startsWith('-'))
      .map(line => line.slice(2).split(':')[0].trim());

    return businessNames
      .map(name => availableBusinesses.find(b => 
        b.name.toLowerCase().includes(name.toLowerCase())
      ))
      .filter((b): b is Business => b !== undefined);
  }

  private static parseSentimentResponse(response: string) {
    // Simple parsing logic - in a real app, use more robust parsing
    const lines = response.split('\n');
    const overall = parseFloat(lines[0]?.split(':')[1] || '0');
    const aspects: { [key: string]: number } = {};
    const keywords = lines[2]?.split(':')[1]?.split(',').map(k => k.trim()) || [];
    const summary = lines[3]?.split(':')[1]?.trim() || '';

    // Parse aspect scores
    const aspectLine = lines[1]?.split(':')[1] || '';
    aspectLine.split(',').forEach(aspect => {
      const [key, score] = aspect.split('=');
      if (key && score) {
        aspects[key.trim()] = parseFloat(score);
      }
    });

    return { overall, aspects, keywords, summary };
  }
}