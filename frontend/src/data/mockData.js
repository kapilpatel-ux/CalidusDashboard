// Mock Data for B2B Defense Supplier Marketplace Dashboard

// Document expiry dates for suppliers
const generateExpiryDate = (daysFromNow) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
};

export const suppliers = [
  {
    id: 'sup001',
    name: 'Orion Defense Systems',
    type: 'OEM',
    country: 'United States',
    productsCount: 47,
    rating: 4.8,
    status: 'active',
    email: 'contact@oriondefense.com',
    phone: '+1 (555) 234-5678',
    certifications: ['ISO 9001', 'AS9100D', 'ITAR'],
    joinDate: '2023-03-15',
    profileViews: 2847,
    totalEnquiries: 156,
    image: 'https://images.unsplash.com/photo-1607867992871-34951585c280?w=100&h=100&fit=crop',
    documents: [
      { name: 'Trade License', expiryDate: generateExpiryDate(5), status: 'expiring' },
      { name: 'ISO 9001 Certificate', expiryDate: generateExpiryDate(45), status: 'active' },
      { name: 'ITAR Registration', expiryDate: generateExpiryDate(120), status: 'active' }
    ],
    documentStatus: 'expiring'
  },
  {
    id: 'sup002',
    name: 'Falcon Aerospace Technologies',
    type: 'Tier 1',
    country: 'Germany',
    productsCount: 32,
    rating: 4.6,
    status: 'active',
    email: 'info@falconaero.de',
    phone: '+49 30 12345678',
    certifications: ['ISO 9001', 'EN9100', 'NADCAP'],
    joinDate: '2023-06-22',
    profileViews: 1923,
    totalEnquiries: 89,
    image: 'https://images.unsplash.com/photo-1770411034013-e6cb865ed21a?w=100&h=100&fit=crop',
    documents: [
      { name: 'Trade License', expiryDate: generateExpiryDate(-10), status: 'expired' },
      { name: 'EN9100 Certificate', expiryDate: generateExpiryDate(60), status: 'active' }
    ],
    documentStatus: 'expired'
  },
  {
    id: 'sup003',
    name: 'Titan Tactical Manufacturing',
    type: 'OEM',
    country: 'United Kingdom',
    productsCount: 28,
    rating: 4.5,
    status: 'pending',
    email: 'sales@titantac.co.uk',
    phone: '+44 20 7946 0958',
    certifications: ['ISO 9001', 'Def Stan 05-57'],
    joinDate: '2024-01-08',
    profileViews: 567,
    totalEnquiries: 23,
    image: 'https://images.unsplash.com/photo-1717749789408-f6f73c9e6aac?w=100&h=100&fit=crop',
    documents: [
      { name: 'Trade License', expiryDate: generateExpiryDate(90), status: 'active' },
      { name: 'ISO 9001 Certificate', expiryDate: generateExpiryDate(180), status: 'active' }
    ],
    documentStatus: 'active'
  },
  {
    id: 'sup004',
    name: 'Vanguard Defense Electronics',
    type: 'Tier 2',
    country: 'Israel',
    productsCount: 54,
    rating: 4.9,
    status: 'active',
    email: 'contact@vanguardde.il',
    phone: '+972 3 123 4567',
    certifications: ['ISO 9001', 'AS9100D', 'MIL-STD'],
    joinDate: '2022-11-30',
    profileViews: 3456,
    totalEnquiries: 234,
    image: 'https://images.unsplash.com/photo-1769793153841-bc7c62bc9ac6?w=100&h=100&fit=crop',
    documents: [
      { name: 'Trade License', expiryDate: generateExpiryDate(15), status: 'expiring' },
      { name: 'AS9100D Certificate', expiryDate: generateExpiryDate(200), status: 'active' }
    ],
    documentStatus: 'expiring'
  },
  {
    id: 'sup005',
    name: 'Apex Armor Solutions',
    type: 'OEM',
    country: 'France',
    productsCount: 19,
    rating: 4.3,
    status: 'suspended',
    email: 'info@apexarmor.fr',
    phone: '+33 1 23 45 67 89',
    certifications: ['ISO 9001', 'AQAP 2110'],
    joinDate: '2023-08-14',
    profileViews: 892,
    totalEnquiries: 45,
    image: 'https://images.unsplash.com/photo-1771343917024-0b5397850ccd?w=100&h=100&fit=crop',
    documents: [
      { name: 'VAT Certificate', expiryDate: generateExpiryDate(-30), status: 'expired' },
      { name: 'ISO 9001 Certificate', expiryDate: generateExpiryDate(30), status: 'active' }
    ],
    documentStatus: 'expired'
  },
  {
    id: 'sup006',
    name: 'Nordic Defense Industries',
    type: 'Tier 1',
    country: 'Sweden',
    productsCount: 38,
    rating: 4.7,
    status: 'active',
    email: 'sales@nordicdef.se',
    phone: '+46 8 123 456 78',
    certifications: ['ISO 9001', 'AS9100D'],
    joinDate: '2023-02-28',
    profileViews: 2134,
    totalEnquiries: 112,
    image: 'https://images.unsplash.com/photo-1731363106135-83fb05b5accb?w=100&h=100&fit=crop',
    documents: [
      { name: 'Trade License', expiryDate: generateExpiryDate(365), status: 'active' },
      { name: 'AS9100D Certificate', expiryDate: generateExpiryDate(250), status: 'active' }
    ],
    documentStatus: 'active'
  }
];

export const products = [
  {
    id: 'CAL001',
    name: 'UAV Propulsion System MK-V',
    supplierId: 'sup001',
    supplierName: 'Orion Defense Systems',
    category: 'UAV & Aerospace',
    subcategory: 'Propulsion',
    rating: 4.9,
    status: 'approved',
    price: 'RFQ',
    description: 'Advanced propulsion system for tactical UAVs',
    specifications: ['Max Thrust: 50N', 'Weight: 2.3kg', 'Fuel: JP-8'],
    leadTime: '8-12 weeks',
    countryOfOrigin: 'United States',
    technicalSpecs: 'MIL-STD-810G compliant',
    image: 'https://images.unsplash.com/photo-1607867992871-34951585c280?w=200&h=150&fit=crop'
  },
  {
    id: 'CAL002',
    name: 'Ballistic Armor Plates Level IV',
    supplierId: 'sup003',
    supplierName: 'Titan Tactical Manufacturing',
    category: 'Defense Materials',
    subcategory: 'Body Armor',
    rating: 4.7,
    status: 'approved',
    price: 'RFQ',
    description: 'NIJ Level IV certified ceramic composite plates',
    specifications: ['Protection: Level IV', 'Weight: 2.8kg', 'Size: 10x12"'],
    leadTime: '4-6 weeks',
    countryOfOrigin: 'United Kingdom',
    technicalSpecs: 'NIJ 0101.06 Level IV',
    image: 'https://images.unsplash.com/photo-1717749789408-f6f73c9e6aac?w=200&h=150&fit=crop'
  },
  {
    id: 'CAL003',
    name: 'Tactical Communication Module TCM-200',
    supplierId: 'sup004',
    supplierName: 'Vanguard Defense Electronics',
    category: 'Tactical Electronics',
    subcategory: 'Communications',
    rating: 4.8,
    status: 'pending',
    price: 'RFQ',
    description: 'Encrypted multi-band tactical radio module',
    specifications: ['Bands: VHF/UHF', 'Encryption: AES-256', 'Range: 50km'],
    leadTime: '6-8 weeks',
    countryOfOrigin: 'Israel',
    technicalSpecs: 'MIL-STD-188 compliant',
    image: 'https://images.unsplash.com/photo-1769793153841-bc7c62bc9ac6?w=200&h=150&fit=crop'
  },
  {
    id: 'CAL004',
    name: 'Radar Signal Processing Unit RSP-500',
    supplierId: 'sup002',
    supplierName: 'Falcon Aerospace Technologies',
    category: 'Surveillance Systems',
    subcategory: 'Radar',
    rating: 4.6,
    status: 'approved',
    price: 'RFQ',
    description: 'High-performance radar signal processor',
    specifications: ['Processing: 10 GFLOPS', 'Channels: 16', 'Interface: MIL-STD-1553'],
    leadTime: '10-14 weeks',
    countryOfOrigin: 'Germany',
    technicalSpecs: 'DO-178C DAL-B',
    image: 'https://images.unsplash.com/photo-1770411034013-e6cb865ed21a?w=200&h=150&fit=crop'
  },
  {
    id: 'CAL005',
    name: 'Night Vision Goggles NVG-7X',
    supplierId: 'sup004',
    supplierName: 'Vanguard Defense Electronics',
    category: 'Surveillance Systems',
    subcategory: 'Night Vision',
    rating: 4.5,
    status: 'rejected',
    price: 'RFQ',
    description: 'Gen 3 white phosphor night vision system',
    specifications: ['Gen: 3+', 'FOV: 40°', 'Weight: 450g'],
    leadTime: '12-16 weeks',
    countryOfOrigin: 'Israel',
    technicalSpecs: 'MIL-STD-810H',
    image: 'https://images.unsplash.com/photo-1771343917024-0b5397850ccd?w=200&h=150&fit=crop'
  },
  {
    id: 'CAL006',
    name: 'Armored Vehicle Power Pack AVP-800',
    supplierId: 'sup006',
    supplierName: 'Nordic Defense Industries',
    category: 'Defense Materials',
    subcategory: 'Power Systems',
    rating: 4.8,
    status: 'approved',
    price: 'RFQ',
    description: 'Integrated power pack for armored vehicles',
    specifications: ['Power: 800hp', 'Torque: 2400Nm', 'Type: Diesel'],
    leadTime: '16-20 weeks',
    countryOfOrigin: 'Sweden',
    technicalSpecs: 'NATO STANAG 4569',
    image: 'https://images.unsplash.com/photo-1731363106135-83fb05b5accb?w=200&h=150&fit=crop'
  },
  {
    id: 'CAL007',
    name: 'Drone Detection System DDS-100',
    supplierId: 'sup001',
    supplierName: 'Orion Defense Systems',
    category: 'Surveillance Systems',
    subcategory: 'Counter-UAS',
    rating: 4.4,
    status: 'pending',
    price: 'RFQ',
    description: 'Multi-sensor drone detection and tracking',
    specifications: ['Range: 5km', 'Detection: RF/Radar/EO', 'Tracking: 50 targets'],
    leadTime: '8-12 weeks',
    countryOfOrigin: 'United States',
    technicalSpecs: 'FAA Part 107 compliant',
    image: 'https://images.unsplash.com/photo-1607867992871-34951585c280?w=200&h=150&fit=crop'
  },
  {
    id: 'CAL008',
    name: 'Composite Armor Panel CAP-III',
    supplierId: 'sup005',
    supplierName: 'Apex Armor Solutions',
    category: 'Defense Materials',
    subcategory: 'Vehicle Armor',
    rating: 4.2,
    status: 'approved',
    price: 'RFQ',
    description: 'Lightweight composite armor for vehicles',
    specifications: ['Protection: STANAG 4569 L3', 'Weight: 45kg/m²', 'Thickness: 25mm'],
    leadTime: '6-10 weeks',
    countryOfOrigin: 'France',
    technicalSpecs: 'STANAG 4569 Level 3',
    image: 'https://images.unsplash.com/photo-1717749789408-f6f73c9e6aac?w=200&h=150&fit=crop'
  }
];

export const buyers = [
  {
    id: 'buy001',
    name: 'James Mitchell',
    company: 'US Army Procurement Division',
    country: 'United States',
    enquiriesSent: 34,
    status: 'active',
    email: 'j.mitchell@army.mil',
    phone: '+1 (555) 123-4567',
    joinDate: '2023-05-12',
    ratingsSubmitted: 12
  },
  {
    id: 'buy002',
    name: 'Sarah Chen',
    company: 'NATO Allied Command',
    country: 'Belgium',
    enquiriesSent: 28,
    status: 'active',
    email: 's.chen@nato.int',
    phone: '+32 2 707 1111',
    joinDate: '2023-07-20',
    ratingsSubmitted: 8
  },
  {
    id: 'buy003',
    name: 'Hans Weber',
    company: 'Bundeswehr Procurement',
    country: 'Germany',
    enquiriesSent: 45,
    status: 'active',
    email: 'h.weber@bundeswehr.de',
    phone: '+49 30 1234567',
    joinDate: '2022-12-05',
    ratingsSubmitted: 15
  },
  {
    id: 'buy004',
    name: 'Marie Dubois',
    company: 'DGA France',
    country: 'France',
    enquiriesSent: 19,
    status: 'suspended',
    email: 'm.dubois@dga.gouv.fr',
    phone: '+33 1 45 52 45 52',
    joinDate: '2024-01-15',
    ratingsSubmitted: 3
  },
  {
    id: 'buy005',
    name: 'David Kim',
    company: 'ROK Defense Agency',
    country: 'South Korea',
    enquiriesSent: 52,
    status: 'active',
    email: 'd.kim@dapa.go.kr',
    phone: '+82 2 1234 5678',
    joinDate: '2023-03-28',
    ratingsSubmitted: 22
  }
];

export const ratings = [
  {
    id: 'RAT001',
    productId: 'CAL001',
    productName: 'UAV Propulsion System MK-V',
    buyerId: 'buy001',
    buyerName: 'James Mitchell',
    rating: 5,
    review: 'Excellent propulsion system. Met all our requirements for tactical UAV operations.',
    submissionDate: '2024-01-15',
    status: 'approved',
    supplierReply: null,
    supplierReplyStatus: null,
    isEditable: false
  },
  {
    id: 'RAT002',
    productId: 'CAL002',
    productName: 'Ballistic Armor Plates Level IV',
    buyerId: 'buy003',
    buyerName: 'Hans Weber',
    rating: 4,
    review: 'Good quality armor plates. Delivery was on time. Minor documentation issues.',
    submissionDate: '2024-01-18',
    status: 'pending',
    supplierReply: null,
    supplierReplyStatus: null,
    isEditable: false
  },
  {
    id: 'RAT003',
    productId: 'CAL004',
    productName: 'Radar Signal Processing Unit RSP-500',
    buyerId: 'buy002',
    buyerName: 'Sarah Chen',
    rating: 5,
    review: 'Outstanding performance. Integration with existing systems was seamless.',
    submissionDate: '2024-01-20',
    status: 'approved',
    supplierReply: 'Thank you for your positive feedback! We are glad the integration went smoothly.',
    supplierReplyStatus: 'approved',
    isEditable: false
  },
  {
    id: 'RAT004',
    productId: 'CAL006',
    productName: 'Armored Vehicle Power Pack AVP-800',
    buyerId: 'buy005',
    buyerName: 'David Kim',
    rating: 4,
    review: 'Reliable power pack. Good technical support from the supplier.',
    submissionDate: '2024-01-22',
    status: 'pending',
    supplierReply: null,
    supplierReplyStatus: null,
    isEditable: false
  },
  {
    id: 'RAT005',
    productId: 'CAL003',
    productName: 'Tactical Communication Module TCM-200',
    buyerId: 'buy001',
    buyerName: 'James Mitchell',
    rating: 3,
    review: 'Decent product but had some compatibility issues with legacy systems.',
    submissionDate: '2024-01-25',
    status: 'approved',
    supplierReply: 'We apologize for the compatibility issues. Our team is working on a firmware update.',
    supplierReplyStatus: 'pending',
    isEditable: false
  }
];

export const enquiries = [
  {
    id: 'ENQ001',
    productId: 'CAL001',
    productName: 'UAV Propulsion System MK-V',
    supplierId: 'sup001',
    supplierName: 'Orion Defense Systems',
    buyerId: 'buy001',
    buyerName: 'James Mitchell',
    buyerCompany: 'US Army Procurement Division',
    message: 'Interested in bulk order of 50 units. Please provide pricing and lead time.',
    date: '2024-01-20',
    status: 'replied',
    reply: 'Thank you for your interest. Please find attached our quotation for 50 units. Lead time is 8-12 weeks.',
    replyDate: '2024-01-21'
  },
  {
    id: 'ENQ002',
    productId: 'CAL003',
    productName: 'Tactical Communication Module TCM-200',
    supplierId: 'sup004',
    supplierName: 'Vanguard Defense Electronics',
    buyerId: 'buy002',
    buyerName: 'Sarah Chen',
    buyerCompany: 'NATO Allied Command',
    message: 'Need technical specifications for interoperability assessment.',
    date: '2024-01-22',
    status: 'pending',
    reply: null,
    replyDate: null
  },
  {
    id: 'ENQ003',
    productId: 'CAL006',
    productName: 'Armored Vehicle Power Pack AVP-800',
    supplierId: 'sup006',
    supplierName: 'Nordic Defense Industries',
    buyerId: 'buy003',
    buyerName: 'Hans Weber',
    buyerCompany: 'Bundeswehr Procurement',
    message: 'Requesting information on maintenance requirements and spare parts availability.',
    date: '2024-01-23',
    status: 'replied',
    reply: 'Please find the maintenance manual attached. Spare parts can be delivered within 2 weeks.',
    replyDate: '2024-01-24'
  },
  {
    id: 'ENQ004',
    productId: 'CAL002',
    productName: 'Ballistic Armor Plates Level IV',
    supplierId: 'sup003',
    supplierName: 'Titan Tactical Manufacturing',
    buyerId: 'buy005',
    buyerName: 'David Kim',
    buyerCompany: 'ROK Defense Agency',
    message: 'Can you provide samples for testing and certification verification?',
    date: '2024-01-24',
    status: 'pending',
    reply: null,
    replyDate: null
  },
  {
    id: 'ENQ005',
    productId: 'CAL007',
    productName: 'Drone Detection System DDS-100',
    supplierId: 'sup001',
    supplierName: 'Orion Defense Systems',
    buyerId: 'buy002',
    buyerName: 'Sarah Chen',
    buyerCompany: 'NATO Allied Command',
    message: 'Interested in evaluation for base protection. What are the demo options?',
    date: '2024-01-25',
    status: 'replied',
    reply: 'We can arrange an on-site demonstration. Please let us know your preferred dates.',
    replyDate: '2024-01-26'
  }
];

export const categories = [
  {
    id: 'CAT001',
    name: 'UAV & Aerospace',
    subcategories: [
      { id: 'SUB001', name: 'Propulsion' },
      { id: 'SUB002', name: 'Avionics' },
      { id: 'SUB003', name: 'Airframes' },
      { id: 'SUB004', name: 'Sensors' },
      { id: 'SUB005', name: 'Ground Control' }
    ],
    productCount: 67
  },
  {
    id: 'CAT002',
    name: 'Tactical Electronics',
    subcategories: [
      { id: 'SUB006', name: 'Communications' },
      { id: 'SUB007', name: 'Navigation' },
      { id: 'SUB008', name: 'Electronic Warfare' },
      { id: 'SUB009', name: 'Computing' }
    ],
    productCount: 89
  },
  {
    id: 'CAT003',
    name: 'Surveillance Systems',
    subcategories: [
      { id: 'SUB010', name: 'Radar' },
      { id: 'SUB011', name: 'Night Vision' },
      { id: 'SUB012', name: 'Counter-UAS' },
      { id: 'SUB013', name: 'SIGINT' },
      { id: 'SUB014', name: 'Cameras' }
    ],
    productCount: 54
  },
  {
    id: 'CAT004',
    name: 'Defense Materials',
    subcategories: [
      { id: 'SUB015', name: 'Body Armor' },
      { id: 'SUB016', name: 'Vehicle Armor' },
      { id: 'SUB017', name: 'Composites' },
      { id: 'SUB018', name: 'Power Systems' }
    ],
    productCount: 43
  },
  {
    id: 'CAT005',
    name: 'Weapon Systems',
    subcategories: [
      { id: 'SUB019', name: 'Small Arms' },
      { id: 'SUB020', name: 'Ammunition' },
      { id: 'SUB021', name: 'Optics' },
      { id: 'SUB022', name: 'Accessories' }
    ],
    productCount: 78
  },
  {
    id: 'CAT006',
    name: 'Vehicle Systems',
    subcategories: [
      { id: 'SUB023', name: 'Armored Vehicles' },
      { id: 'SUB024', name: 'Naval' },
      { id: 'SUB025', name: 'Support Vehicles' },
      { id: 'SUB026', name: 'Unmanned Ground' }
    ],
    productCount: 35
  }
];

// Notifications
export const notifications = [
  {
    id: 'NOT001',
    type: 'approval',
    title: 'New Supplier Pending Approval',
    message: 'Titan Tactical Manufacturing has registered and is awaiting approval.',
    date: '2024-01-26',
    read: false,
    link: 'suppliers'
  },
  {
    id: 'NOT002',
    type: 'expiry',
    title: 'Document Expiring Soon',
    message: 'Trade License for Orion Defense Systems expires in 5 days.',
    date: '2024-01-25',
    read: false,
    link: 'suppliers'
  },
  {
    id: 'NOT003',
    type: 'expiry',
    title: 'Document Expired',
    message: 'Trade License for Falcon Aerospace Technologies has expired.',
    date: '2024-01-24',
    read: true,
    link: 'suppliers'
  },
  {
    id: 'NOT004',
    type: 'rating',
    title: 'New Rating Submitted',
    message: 'Hans Weber submitted a rating for Ballistic Armor Plates.',
    date: '2024-01-23',
    read: false,
    link: 'ratings'
  },
  {
    id: 'NOT005',
    type: 'enquiry',
    title: 'New Enquiry Received',
    message: 'Sarah Chen sent an enquiry about Tactical Communication Module.',
    date: '2024-01-22',
    read: true,
    link: 'enquiries'
  }
];

// Messages/Conversations
export const messages = [
  {
    id: 'MSG001',
    enquiryId: 'ENQ001',
    productName: 'UAV Propulsion System MK-V',
    participants: ['James Mitchell', 'Orion Defense Systems'],
    lastMessage: 'Thank you for your interest. Please find attached our quotation.',
    lastDate: '2024-01-21',
    unread: 0
  },
  {
    id: 'MSG002',
    enquiryId: 'ENQ002',
    productName: 'Tactical Communication Module TCM-200',
    participants: ['Sarah Chen', 'Vanguard Defense Electronics'],
    lastMessage: 'Need technical specifications for interoperability assessment.',
    lastDate: '2024-01-22',
    unread: 1
  },
  {
    id: 'MSG003',
    enquiryId: 'ENQ003',
    productName: 'Armored Vehicle Power Pack AVP-800',
    participants: ['Hans Weber', 'Nordic Defense Industries'],
    lastMessage: 'Please find the maintenance manual attached.',
    lastDate: '2024-01-24',
    unread: 0
  },
  {
    id: 'MSG004',
    enquiryId: 'ENQ004',
    productName: 'Ballistic Armor Plates Level IV',
    participants: ['David Kim', 'Titan Tactical Manufacturing'],
    lastMessage: 'Can you provide samples for testing?',
    lastDate: '2024-01-24',
    unread: 2
  }
];

// Analytics data for charts
export const analyticsData = {
  mostSearchedComponents: [
    { name: 'UAV Propulsion', searches: 1245 },
    { name: 'Night Vision', searches: 987 },
    { name: 'Tactical Radios', searches: 876 },
    { name: 'Body Armor', searches: 765 },
    { name: 'Radar Systems', searches: 654 }
  ],
  topRatedSuppliers: [
    { name: 'Vanguard Defense', rating: 4.9 },
    { name: 'Orion Defense', rating: 4.8 },
    { name: 'Nordic Defense', rating: 4.7 },
    { name: 'Falcon Aerospace', rating: 4.6 },
    { name: 'Titan Tactical', rating: 4.5 }
  ],
  mostActiveSuppliers: [
    { name: 'Vanguard Defense', products: 54, enquiries: 234 },
    { name: 'Orion Defense', products: 47, enquiries: 156 },
    { name: 'Nordic Defense', products: 38, enquiries: 112 },
    { name: 'Falcon Aerospace', products: 32, enquiries: 89 },
    { name: 'Titan Tactical', products: 28, enquiries: 67 }
  ],
  categoryDemandTrends: [
    { month: 'Sep', uav: 120, electronics: 98, surveillance: 85, materials: 67 },
    { month: 'Oct', uav: 145, electronics: 112, surveillance: 92, materials: 78 },
    { month: 'Nov', uav: 168, electronics: 125, surveillance: 108, materials: 89 },
    { month: 'Dec', uav: 132, electronics: 142, surveillance: 95, materials: 94 },
    { month: 'Jan', uav: 189, electronics: 156, surveillance: 118, materials: 102 }
  ],
  monthlyEnquiries: [
    { month: 'Sep', enquiries: 234 },
    { month: 'Oct', enquiries: 287 },
    { month: 'Nov', enquiries: 312 },
    { month: 'Dec', enquiries: 276 },
    { month: 'Jan', enquiries: 345 }
  ]
};

// Current supplier data (for supplier dashboard simulation)
export const currentSupplier = suppliers[0]; // Orion Defense Systems

// Current buyer data (for buyer dashboard simulation)
export const currentBuyer = buyers[0]; // James Mitchell

// Supplier-specific notifications
export const supplierNotifications = [
  {
    id: 'SNOT001',
    type: 'expiry',
    title: 'Document Expiring Soon',
    message: 'Your Trade License expires in 5 days. Please re-upload.',
    date: '2024-01-26',
    read: false,
    urgent: true,
    link: 'profile'
  },
  {
    id: 'SNOT002',
    type: 'enquiry',
    title: 'New Enquiry Received',
    message: 'James Mitchell sent an enquiry about UAV Propulsion System.',
    date: '2024-01-25',
    read: false,
    urgent: false,
    link: 'enquiries'
  },
  {
    id: 'SNOT003',
    type: 'rating',
    title: 'New Review Posted',
    message: 'A buyer left a review on your UAV Propulsion System.',
    date: '2024-01-24',
    read: true,
    urgent: false,
    link: 'ratings'
  },
  {
    id: 'SNOT004',
    type: 'approval',
    title: 'Product Approved',
    message: 'Your Drone Detection System DDS-100 has been approved.',
    date: '2024-01-23',
    read: true,
    urgent: false,
    link: 'products'
  }
];

// Calculate document expiry stats
export const getDocumentExpiryStats = (suppliersList) => {
  let expired = 0;
  let expiring7 = 0;
  let expiring15 = 0;
  let expiring30 = 0;

  const today = new Date();
  
  suppliersList.forEach(supplier => {
    supplier.documents?.forEach(doc => {
      const expiryDate = new Date(doc.expiryDate);
      const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry < 0) {
        expired++;
      } else if (daysUntilExpiry <= 7) {
        expiring7++;
      } else if (daysUntilExpiry <= 15) {
        expiring15++;
      } else if (daysUntilExpiry <= 30) {
        expiring30++;
      }
    });
  });

  return { expired, expiring7, expiring15, expiring30, total: expired + expiring7 + expiring15 + expiring30 };
};
