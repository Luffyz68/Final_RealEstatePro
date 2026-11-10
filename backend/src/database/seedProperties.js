require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const database = require('../config/database');

const properties = [
  {
    title: 'Modern Luxury Villa with Pool',
    description: 'A stunning modern villa featuring a private infinity pool, smart home automation, and panoramic city views. Perfect for entertaining guests.',
    price: 850000,
    property_type_id: 2, // Villa
    listing_type: 'sale',
    status: 'available',
    approval_status: 'approved',
    bedrooms: 5,
    bathrooms: 4.5,
    area: 450,
    location_id: 1, // BKK1, Phnom Penh
    agent_id: 2, // John Smith
    main_image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
    amenities: 'Pool, Smart Home, Garage, Garden, Security System',
    featured: 1
  },
  {
    title: 'Cozy Downtown Apartment',
    description: 'Beautifully furnished 1-bedroom apartment right in the heart of the city. Close to malls, restaurants, and public transport.',
    price: 850,
    property_type_id: 3, // Apartment
    listing_type: 'rent',
    status: 'available',
    approval_status: 'approved',
    bedrooms: 1,
    bathrooms: 1,
    area: 55,
    location_id: 2, // Toul Kork
    agent_id: 3, // Sarah Jenkins
    main_image: 'https://images.unsplash.com/photo-1502672260266-1c1cd2cb4434?auto=format&fit=crop&w=800&q=80',
    amenities: 'Gym, Balcony, Furnished, Elevators',
    featured: 0
  },
  {
    title: 'Spacious Family House',
    description: 'A wonderful 4-bedroom house located in a quiet and secure neighborhood. Features a large backyard perfect for kids and pets.',
    price: 320000,
    property_type_id: 1, // House
    listing_type: 'sale',
    status: 'available',
    approval_status: 'approved',
    bedrooms: 4,
    bathrooms: 3,
    area: 250,
    location_id: 1,
    agent_id: 4, // David Chen
    main_image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    amenities: 'Backyard, Parking, Pet Friendly',
    featured: 1
  },
  {
    title: 'High-Rise Luxury Condo',
    description: 'Experience luxury living on the 25th floor. Features floor-to-ceiling windows, premium appliances, and access to a rooftop pool.',
    price: 1500,
    property_type_id: 4, // Condo
    listing_type: 'rent',
    status: 'available',
    approval_status: 'approved',
    bedrooms: 2,
    bathrooms: 2,
    area: 95,
    location_id: 1,
    agent_id: 2,
    main_image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    amenities: 'Rooftop Pool, Gym, 24/7 Security, Parking',
    featured: 1
  },
  {
    title: 'Riverside Retreat Villa',
    description: 'Escape the city to this peaceful riverside villa. Features a private dock, massive garden, and traditional architectural elements.',
    price: 450000,
    property_type_id: 2,
    listing_type: 'sale',
    status: 'available',
    approval_status: 'approved',
    bedrooms: 3,
    bathrooms: 3,
    area: 600,
    location_id: 5, // Kampot
    agent_id: 3,
    main_image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
    amenities: 'River View, Garden, Boat Dock',
    featured: 0
  },
  {
    title: 'Commercial Office Space',
    description: 'Prime office space ready for your business. Located in a major commercial hub with high foot traffic.',
    price: 2500,
    property_type_id: 6, // Office
    listing_type: 'rent',
    status: 'available',
    approval_status: 'approved',
    bedrooms: 0,
    bathrooms: 2,
    area: 150,
    location_id: 1,
    agent_id: 4,
    main_image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    amenities: 'Meeting Rooms, High Speed Internet, Reception',
    featured: 0
  },
  {
    title: 'Beachfront Land Plot',
    description: 'Rare opportunity to own beachfront property. Ideal for developing a resort, hotel, or private estate.',
    price: 1200000,
    property_type_id: 5, // Land
    listing_type: 'sale',
    status: 'available',
    approval_status: 'approved',
    bedrooms: 0,
    bathrooms: 0,
    area: 2500,
    location_id: 4, // Sihanoukville
    agent_id: 2,
    main_image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    amenities: 'Ocean View, Beach Access',
    featured: 1
  },
  {
    title: 'Minimalist Studio Apartment',
    description: 'Perfect for young professionals. Clean, minimalist design with space-saving furniture included.',
    price: 450,
    property_type_id: 3,
    listing_type: 'rent',
    status: 'available',
    approval_status: 'approved',
    bedrooms: 1,
    bathrooms: 1,
    area: 40,
    location_id: 2,
    agent_id: 3,
    main_image: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80',
    amenities: 'Furnished, Gym, Laundry',
    featured: 0
  },
  {
    title: 'Classic French Colonial House',
    description: 'A meticulously restored colonial-era house with high ceilings, vintage tiles, and lush surroundings.',
    price: 750000,
    property_type_id: 1,
    listing_type: 'sale',
    status: 'available',
    approval_status: 'approved',
    bedrooms: 4,
    bathrooms: 3,
    area: 380,
    location_id: 6, // Battambang
    agent_id: 4,
    main_image: 'https://images.unsplash.com/photo-1605276374104-aa237f7cecd7?auto=format&fit=crop&w=800&q=80',
    amenities: 'Historic, Garden, High Ceilings',
    featured: 1
  },
  {
    title: 'Modern Retail Shop',
    description: 'Ground floor retail space on a busy street. Large display windows and modern lighting.',
    price: 1200,
    property_type_id: 7, // Shop
    listing_type: 'rent',
    status: 'available',
    approval_status: 'approved',
    bedrooms: 0,
    bathrooms: 1,
    area: 80,
    location_id: 3, // Siem Reap
    agent_id: 2,
    main_image: 'https://images.unsplash.com/photo-1555529771-835f59fc5efe?auto=format&fit=crop&w=800&q=80',
    amenities: 'Street Facing, Display Windows, AC',
    featured: 0
  },
  {
    title: 'Eco-Friendly Jungle Villa',
    description: 'Immerse yourself in nature with this off-grid eco-villa. Solar powered with sustainable materials.',
    price: 280000,
    property_type_id: 2,
    listing_type: 'sale',
    status: 'available',
    approval_status: 'approved',
    bedrooms: 2,
    bathrooms: 2,
    area: 200,
    location_id: 5,
    agent_id: 3,
    main_image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80',
    amenities: 'Solar Power, Forest View, Sustainable',
    featured: 0
  },
  {
    title: 'Penthouse Suite',
    description: 'The ultimate luxury experience. The entire top floor, featuring a private terrace and 360-degree city views.',
    price: 2500000,
    property_type_id: 4,
    listing_type: 'sale',
    status: 'available',
    approval_status: 'approved',
    bedrooms: 4,
    bathrooms: 4.5,
    area: 550,
    location_id: 1,
    agent_id: 4,
    main_image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80',
    amenities: 'Private Terrace, Private Elevator, Smart Home, Concierge',
    featured: 1
  }
];

const seedProperties = async () => {
  console.log('Seeding properties...');
  let count = 0;
  for (const property of properties) {
    try {
      await database.run(
        `INSERT INTO properties (
          title, description, price, property_type_id, listing_type, 
          status, approval_status, bedrooms, bathrooms, area, location_id, 
          agent_id, main_image, amenities, featured
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          property.title, property.description, property.price, property.property_type_id, property.listing_type,
          property.status, property.approval_status, property.bedrooms, property.bathrooms, property.area, property.location_id,
          property.agent_id, property.main_image, property.amenities, property.featured
        ]
      );
      count++;
    } catch (err) {
      console.error('Failed to insert:', property.title, err.message);
    }
  }
  console.log(`Successfully seeded ${count} properties.`);
};

seedProperties()
  .then(() => database.close())
  .catch((error) => {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  });
