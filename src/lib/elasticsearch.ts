import { Client } from '@elastic/elasticsearch';
import { Business, Product } from '../types';

// Initialize Elasticsearch client
const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
    password: process.env.ELASTICSEARCH_PASSWORD || ''
  }
});

export class ElasticsearchService {
  // Index a business document
  static async indexBusiness(business: Business) {
    await client.index({
      index: 'businesses',
      id: business.id,
      document: {
        name: business.name,
        description: business.description,
        category: business.category,
        location: {
          lat: business.location.latitude,
          lon: business.location.longitude
        },
        rating: business.stats?.averageRating || 0,
        isVerified: business.isVerified,
        features: business.features,
        keywords: this.generateKeywords(business)
      }
    });
  }

  // Search businesses with advanced filtering
  static async searchBusinesses(query: string, filters: any = {}) {
    const { category, location, rating, distance } = filters;

    const searchQuery = {
      bool: {
        must: [
          {
            multi_match: {
              query,
              fields: ['name^3', 'description^2', 'category', 'features', 'keywords'],
              fuzziness: 'AUTO'
            }
          }
        ],
        filter: []
      }
    };

    // Apply filters
    if (category) {
      searchQuery.bool.filter.push({ term: { category } });
    }

    if (rating) {
      searchQuery.bool.filter.push({ range: { rating: { gte: rating } } });
    }

    if (location && distance) {
      searchQuery.bool.filter.push({
        geo_distance: {
          distance: `${distance}km`,
          location: {
            lat: location.latitude,
            lon: location.longitude
          }
        }
      });
    }

    const result = await client.search({
      index: 'businesses',
      query: searchQuery,
      sort: [
        '_score',
        { rating: 'desc' }
      ]
    });

    return result.hits.hits.map(hit => ({
      ...hit._source,
      score: hit._score,
      id: hit._id
    }));
  }

  // Generate keywords for better search
  private static generateKeywords(business: Business): string[] {
    const keywords = new Set<string>();
    
    // Add name words
    business.name.toLowerCase().split(' ').forEach(word => keywords.add(word));
    
    // Add category
    keywords.add(business.category.toLowerCase());
    
    // Add features
    business.features.forEach(feature => 
      feature.toLowerCase().split(' ').forEach(word => keywords.add(word))
    );
    
    // Add location
    keywords.add(business.location.city.toLowerCase());
    keywords.add(business.location.state.toLowerCase());
    
    return Array.from(keywords);
  }

  // Suggest businesses based on user preferences
  static async getSuggestions(userId: string, preferences: string[]) {
    const result = await client.search({
      index: 'businesses',
      query: {
        bool: {
          should: preferences.map(pref => ({
            match: {
              keywords: pref
            }
          })),
          minimum_should_match: 1
        }
      },
      sort: [
        { rating: 'desc' },
        '_score'
      ],
      size: 10
    });

    return result.hits.hits.map(hit => ({
      ...hit._source,
      score: hit._score,
      id: hit._id
    }));
  }
}