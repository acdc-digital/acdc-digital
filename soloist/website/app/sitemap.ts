import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://soloist.app'
  const currentDate = new Date()

  return [
    // Homepage - Highest priority
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    
    // Main App/Server Page
    {
      url: `${baseUrl}/server`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },

    // Blog - High priority for content discovery
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },

    // Wiki/Documentation Hub
    {
      url: `${baseUrl}/wiki`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },

    // Wiki - User Guide (Important for new users)
    {
      url: `${baseUrl}/wiki/user-guide`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },

    // Wiki - Authentication Documentation
    {
      url: `${baseUrl}/wiki/authentication`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },

    // Wiki - State Management Documentation
    {
      url: `${baseUrl}/wiki/statemanagement`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },

    // Wiki - Brand Guidelines
    {
      url: `${baseUrl}/wiki/brand`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },

    // Legal Pages - Important for compliance
    {
      url: `${baseUrl}/wiki/privacy-policy`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/wiki/terms-of-service`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },

    // Admin Pages - Lower priority (internal tools)
    {
      url: `${baseUrl}/admin`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/admin/openai`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]
}
