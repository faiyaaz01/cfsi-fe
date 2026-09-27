import { Course, NewsPost } from '../types';

export const SITE_URL = 'https://cfsi.co.in';

/**
 * Google Schema for EducationalOrganization (Institute Knowledge Graph)
 */
export const getOrganizationSchema = (origin = SITE_URL) => ({
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'Central Fire Safety Institute (CFSI)',
  alternateName: ['CFSI Vadodara', 'Central Fire Safety Institute'],
  url: origin,
  logo: `${origin}/assets/cfsi-logo.jpg`,
  image: `${origin}/assets/hero-batch.jpg`,
  description: 'Premier Government-affiliated firefighter and industrial safety training institute in Vadodara, Gujarat offering Diploma, Sub-Fire Officer, and Health & Safety courses.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Akhil Hind Mahila Parishad Building, opp. Nehru Bhawan, Kirtistambh',
    addressLocality: 'Vadodara',
    addressRegion: 'Gujarat',
    postalCode: '390001',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '22.3008',
    longitude: '73.2043',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-9876543210',
    contactType: 'Admissions and Student Inquiries',
    areaServed: 'IN',
    availableLanguage: ['English', 'Hindi', 'Gujarati'],
  },
  sameAs: [
    'https://www.facebook.com/cfsivadodara',
    'https://www.instagram.com/cfsivadodara',
    'https://www.youtube.com/@cfsivadodara',
  ],
});

/**
 * Google Schema for Course Rich Snippets
 */
export const getCourseSchema = (course: Course, origin = SITE_URL) => ({
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: course.title,
  description: course.shortDescription || course.fullDescription,
  provider: {
    '@type': 'EducationalOrganization',
    name: 'Central Fire Safety Institute (CFSI)',
    url: origin,
  },
  educationalCredentialAwarded: course.certificationBody || 'Diploma in Fire & Safety Engineering',
  coursePrerequisites: course.eligibility || '10th / 12th / Graduate',
  timeRequired: course.duration,
  offers: {
    '@type': 'Offer',
    price: course.feeNumber || 0,
    priceCurrency: 'INR',
    category: 'Tuition',
    availability: 'https://schema.org/InStock',
    url: `${origin}/courses/${course.slug || course.id}`,
  },
  hasCourseInstance: {
    '@type': 'CourseInstance',
    courseMode: 'Blended (Classroom Theory + Practical Ground Drills)',
    location: 'Vadodara Campus, Gujarat',
  },
});

/**
 * Google Schema for Course List (Item List)
 */
export const getCoursesListSchema = (courses: Course[], origin = SITE_URL) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Fire & Industrial Safety Engineering Courses',
  description: 'Full list of professional firefighter, disaster management, and health & safety courses at CFSI Vadodara.',
  numberOfItems: courses.length,
  itemListElement: courses.map((course, idx) => ({
    '@type': 'ListItem',
    position: idx + 1,
    item: {
      '@type': 'Course',
      name: course.title,
      description: course.shortDescription,
      url: `${origin}/courses/${course.slug || course.id}`,
    },
  })),
});

/**
 * Google Schema for NewsArticle (Google News & Carousel Snippets)
 */
export const getNewsArticleSchema = (post: NewsPost, origin = SITE_URL) => ({
  '@context': 'https://schema.org',
  '@type': 'NewsArticle',
  headline: post.title,
  description: post.excerpt,
  articleBody: post.content,
  image: post.imageUrl ? [post.imageUrl] : [`${origin}/assets/hero-batch.jpg`],
  datePublished: post.createdAt || new Date().toISOString(),
  dateModified: post.createdAt || new Date().toISOString(),
  author: {
    '@type': 'Person',
    name: post.author || 'CFSI Editorial Board',
  },
  publisher: {
    '@type': 'EducationalOrganization',
    name: 'Central Fire Safety Institute (CFSI)',
    logo: {
      '@type': 'ImageObject',
      url: `${origin}/assets/cfsi-logo.jpg`,
    },
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `${origin}/news`,
  },
});

/**
 * Google Schema for Breadcrumb Navigation
 */
export const getBreadcrumbSchema = (items: Array<{ name: string; url: string }>, origin = SITE_URL) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, idx) => ({
    '@type': 'ListItem',
    position: idx + 1,
    name: item.name,
    item: item.url.startsWith('http') ? item.url : `${origin}${item.url}`,
  })),
});
