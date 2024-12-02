import { Business } from '../types';

export const publicInstitutions: Omit<Business, 'id' | 'createdAt'>[] = [
  {
    name: "Kenyatta National Hospital",
    description: "The largest referral and teaching hospital in Kenya, providing specialized healthcare services.",
    category: "Healthcare",
    imageUrl: "https://images.unsplash.com/photo-1632833239869-a37e3a5806d2",
    operatingHours: [
      { day: "monday", open: "00:00", close: "23:59", isClosed: false },
      { day: "tuesday", open: "00:00", close: "23:59", isClosed: false },
      { day: "wednesday", open: "00:00", close: "23:59", isClosed: false },
      { day: "thursday", open: "00:00", close: "23:59", isClosed: false },
      { day: "friday", open: "00:00", close: "23:59", isClosed: false },
      { day: "saturday", open: "00:00", close: "23:59", isClosed: false },
      { day: "sunday", open: "00:00", close: "23:59", isClosed: false }
    ],
    location: {
      address: "Hospital Rd, Upper Hill",
      city: "Nairobi",
      state: "Nairobi County",
      zipCode: "00202",
      country: "Kenya",
      latitude: -1.3019,
      longitude: 36.8060
    },
    contact: {
      phone: "+254 20 2726300",
      email: "info@knh.or.ke",
      website: "https://knh.or.ke"
    },
    amenities: [],
    features: ["24/7 Emergency Services", "Specialized Clinics", "Teaching Hospital"],
    reviews: [],
    averageRating: 4.2,
    ownerId: "system",
    isVerified: true,
    isPublicInstitution: true,
    institutionType: "healthcare",
    updatedAt: new Date().toISOString()
  },
  {
    name: "University of Nairobi",
    description: "Kenya's premier institution of higher learning, offering diverse academic programs.",
    category: "Education",
    imageUrl: "https://images.unsplash.com/photo-1562774053-701939374585",
    operatingHours: [
      { day: "monday", open: "08:00", close: "17:00", isClosed: false },
      { day: "tuesday", open: "08:00", close: "17:00", isClosed: false },
      { day: "wednesday", open: "08:00", close: "17:00", isClosed: false },
      { day: "thursday", open: "08:00", close: "17:00", isClosed: false },
      { day: "friday", open: "08:00", close: "17:00", isClosed: false },
      { day: "saturday", open: "08:00", close: "13:00", isClosed: false },
      { day: "sunday", open: "00:00", close: "00:00", isClosed: true }
    ],
    location: {
      address: "University Way",
      city: "Nairobi",
      state: "Nairobi County",
      zipCode: "30197",
      country: "Kenya",
      latitude: -1.2921,
      longitude: 36.8219
    },
    contact: {
      phone: "+254 20 4910000",
      email: "info@uonbi.ac.ke",
      website: "https://www.uonbi.ac.ke"
    },
    amenities: [],
    features: ["Library", "Research Centers", "Sports Facilities"],
    reviews: [],
    averageRating: 4.5,
    ownerId: "system",
    isVerified: true,
    isPublicInstitution: true,
    institutionType: "education",
    updatedAt: new Date().toISOString()
  },
  {
    name: "Kiambu County Government Headquarters",
    description: "The main administrative center for Kiambu County government services.",
    category: "Government",
    imageUrl: "https://images.unsplash.com/photo-1577495508048-b635879837f1",
    operatingHours: [
      { day: "monday", open: "08:00", close: "17:00", isClosed: false },
      { day: "tuesday", open: "08:00", close: "17:00", isClosed: false },
      { day: "wednesday", open: "08:00", close: "17:00", isClosed: false },
      { day: "thursday", open: "08:00", close: "17:00", isClosed: false },
      { day: "friday", open: "08:00", close: "17:00", isClosed: false },
      { day: "saturday", open: "00:00", close: "00:00", isClosed: true },
      { day: "sunday", open: "00:00", close: "00:00", isClosed: true }
    ],
    location: {
      address: "Kiambu Road",
      city: "Kiambu",
      state: "Kiambu County",
      zipCode: "00900",
      country: "Kenya",
      latitude: -1.1712,
      longitude: 36.8357
    },
    contact: {
      phone: "+254 67 2222454",
      email: "info@kiambu.go.ke",
      website: "https://kiambu.go.ke"
    },
    amenities: [],
    features: ["County Services", "Administrative Offices"],
    reviews: [],
    averageRating: 4.0,
    ownerId: "system",
    isVerified: true,
    isPublicInstitution: true,
    institutionType: "government",
    updatedAt: new Date().toISOString()
  },
  {
    name: "Kiambu Level 5 Hospital",
    description: "Major public referral hospital serving Kiambu County and surrounding areas.",
    category: "Healthcare",
    imageUrl: "https://images.unsplash.com/photo-1587351021355-a479a299d2f9",
    operatingHours: [
      { day: "monday", open: "00:00", close: "23:59", isClosed: false },
      { day: "tuesday", open: "00:00", close: "23:59", isClosed: false },
      { day: "wednesday", open: "00:00", close: "23:59", isClosed: false },
      { day: "thursday", open: "00:00", close: "23:59", isClosed: false },
      { day: "friday", open: "00:00", close: "23:59", isClosed: false },
      { day: "saturday", open: "00:00", close: "23:59", isClosed: false },
      { day: "sunday", open: "00:00", close: "23:59", isClosed: false }
    ],
    location: {
      address: "Hospital Road, Kiambu",
      city: "Kiambu",
      state: "Kiambu County",
      zipCode: "00900",
      country: "Kenya",
      latitude: -1.1714,
      longitude: 36.8298
    },
    contact: {
      phone: "+254 20 3525454",
      email: "info@kiambuhospital.go.ke",
      website: "https://kiambuhospital.go.ke"
    },
    amenities: [],
    features: ["24/7 Emergency Services", "Maternity Wing", "Outpatient Services"],
    reviews: [],
    averageRating: 4.1,
    ownerId: "system",
    isVerified: true,
    isPublicInstitution: true,
    institutionType: "healthcare",
    updatedAt: new Date().toISOString()
  },
  {
    name: "Nairobi City Hall",
    description: "The headquarters of Nairobi City County, providing essential municipal services.",
    category: "Government",
    imageUrl: "https://images.unsplash.com/photo-1577495508048-b635879837f1",
    operatingHours: [
      { day: "monday", open: "08:00", close: "17:00", isClosed: false },
      { day: "tuesday", open: "08:00", close: "17:00", isClosed: false },
      { day: "wednesday", open: "08:00", close: "17:00", isClosed: false },
      { day: "thursday", open: "08:00", close: "17:00", isClosed: false },
      { day: "friday", open: "08:00", close: "17:00", isClosed: false },
      { day: "saturday", open: "00:00", close: "00:00", isClosed: true },
      { day: "sunday", open: "00:00", close: "00:00", isClosed: true }
    ],
    location: {
      address: "City Hall Way",
      city: "Nairobi",
      state: "Nairobi County",
      zipCode: "00200",
      country: "Kenya",
      latitude: -1.2841,
      longitude: 36.8232
    },
    contact: {
      phone: "+254 20 344194",
      email: "info@nairobicity.go.ke",
      website: "https://nairobi.go.ke"
    },
    amenities: [],
    features: ["Municipal Services", "Revenue Collection", "Licensing"],
    reviews: [],
    averageRating: 3.9,
    ownerId: "system",
    isVerified: true,
    isPublicInstitution: true,
    institutionType: "government",
    updatedAt: new Date().toISOString()
  }
];