import { Business } from '../types';

export const publicInstitutions: Omit<Business, 'id' | 'createdAt'>[] = [
  {
    name: "Kenyatta National Hospital",
    description: "The largest referral and teaching hospital in Kenya, providing specialized healthcare services.",
    category: "Healthcare",
    features: ["24/7 Emergency Services", "Specialized Clinics", "Teaching Hospital"],
    location: {
      address: "Hospital Rd, Upper Hill",
      county: "Nairobi",
      latitude: -1.3019,
      longitude: 36.8060
    },
    contact: {
      phone: "+254 20 2726300",
      email: "info@knh.or.ke",
      website: "https://knh.or.ke"
    },
    hours: {
      monday: "00:00-23:59",
      tuesday: "00:00-23:59",
      wednesday: "00:00-23:59",
      thursday: "00:00-23:59",
      friday: "00:00-23:59",
      saturday: "00:00-23:59",
      sunday: "00:00-23:59"
    },
    photos: ["https://images.unsplash.com/photo-1632833239869-a37e3a5806d2"],
    isVerified: true,
    verificationBadges: [{
      type: "government",
      issuedBy: "Ministry of Health",
      issuedAt: new Date().toISOString()
    }],
    stats: {
      totalReviews: 0,
      averageRating: 4.2,
      totalViews: 0,
      totalBookmarks: 0
    },
    reviews: [],
    claims: []
  },
  {
    name: "University of Nairobi",
    description: "Kenya's premier institution of higher learning, offering diverse academic programs.",
    category: "Education",
    features: ["Library", "Research Centers", "Sports Facilities"],
    location: {
      address: "University Way",
      county: "Nairobi",
      latitude: -1.2921,
      longitude: 36.8219
    },
    contact: {
      phone: "+254 20 4910000",
      email: "info@uonbi.ac.ke",
      website: "https://www.uonbi.ac.ke"
    },
    hours: {
      monday: "08:00-17:00",
      tuesday: "08:00-17:00",
      wednesday: "08:00-17:00",
      thursday: "08:00-17:00",
      friday: "08:00-17:00",
      saturday: "08:00-13:00",
      sunday: "closed"
    },
    photos: ["https://images.unsplash.com/photo-1562774053-701939374585"],
    isVerified: true,
    verificationBadges: [{
      type: "government",
      issuedBy: "Ministry of Education",
      issuedAt: new Date().toISOString()
    }],
    stats: {
      totalReviews: 0,
      averageRating: 4.5,
      totalViews: 0,
      totalBookmarks: 0
    },
    reviews: [],
    claims: []
  },
  {
    name: "Kiambu County Government Headquarters",
    description: "The main administrative center for Kiambu County government services.",
    category: "Government",
    features: ["County Services", "Administrative Offices"],
    location: {
      address: "Kiambu Road",
      county: "Kiambu",
      latitude: -1.1712,
      longitude: 36.8357
    },
    contact: {
      phone: "+254 67 2222454",
      email: "info@kiambu.go.ke",
      website: "https://kiambu.go.ke"
    },
    hours: {
      monday: "08:00-17:00",
      tuesday: "08:00-17:00",
      wednesday: "08:00-17:00",
      thursday: "08:00-17:00",
      friday: "08:00-17:00",
      saturday: "closed",
      sunday: "closed"
    },
    photos: ["https://images.unsplash.com/photo-1577495508048-b635879837f1"],
    isVerified: true,
    verificationBadges: [{
      type: "government",
      issuedBy: "County Government",
      issuedAt: new Date().toISOString()
    }],
    stats: {
      totalReviews: 0,
      averageRating: 4.0,
      totalViews: 0,
      totalBookmarks: 0
    },
    reviews: [],
    claims: []
  }
];
