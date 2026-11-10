require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const database = require('../config/database');
const { runMigrations } = require('./migrate');
const { normalizeEmail, normalizeText, validatePassword } = require('../utils/validation');

const defaultTypes = [
  { name: 'House', description: 'Single family residential home' },
  { name: 'Villa', description: 'Luxury detached residence' },
  { name: 'Apartment', description: 'Multi-unit residential complex' },
  { name: 'Condo', description: 'Individually owned residential unit' },
  { name: 'Land', description: 'Plots and acreage for development' },
  { name: 'Office', description: 'Commercial business space' },
  { name: 'Shop', description: 'Retail storefront property' }
];

const defaultLocations = [
  { province: 'Phnom Penh', city: 'BKK1' },
  { province: 'Phnom Penh', city: 'Toul Kork' },
  { province: 'Siem Reap', city: 'Siem Reap Central' },
  { province: 'Preah Sihanouk', city: 'Sihanoukville' },
  { province: 'Kampot', city: 'Kampot Town' },
  { province: 'Battambang', city: 'Battambang City' }
];

const sampleProperties = [
  {
    title: 'Modern Luxury Villa with Pool',
    description: 'A stunning modern villa featuring a private infinity pool, smart home automation, and panoramic city views. Perfect for entertaining guests.',
    price: 850000,
    typeName: 'Villa',
    listing_type: 'sale',
    status: 'available',
    approval_status: 'approved',
    bedrooms: 5,
    bathrooms: 4.5,
    area: 450,
    locCity: 'BKK1',
    agentEmail: 'john.smith@example.com',
    main_image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
    amenities: 'Pool, Smart Home, Garage, Garden, Security System',
    featured: 1
  },
  {
    title: 'Cozy Downtown Apartment',
    description: 'Beautifully furnished 1-bedroom apartment right in the heart of the city. Close to malls, restaurants, and public transport.',
    price: 850,
    typeName: 'Apartment',
    listing_type: 'rent',
    status: 'available',
    approval_status: 'approved',
    bedrooms: 1,
    bathrooms: 1,
    area: 55,
    locCity: 'Toul Kork',
    agentEmail: 'sarah.jenkins@example.com',
    main_image: 'https://images.unsplash.com/photo-1502672260266-1c1cd2cb4434?auto=format&fit=crop&w=800&q=80',
    amenities: 'Gym, Balcony, Furnished, Elevators',
    featured: 0
  },
  {
    title: 'Spacious Family House',
    description: 'A wonderful 4-bedroom house located in a quiet and secure neighborhood. Features a large backyard perfect for kids and pets.',
    price: 320000,
    typeName: 'House',
    listing_type: 'sale',
    status: 'available',
    approval_status: 'approved',
    bedrooms: 4,
    bathrooms: 3,
    area: 250,
    locCity: 'BKK1',
    agentEmail: 'david.chen@example.com',
    main_image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    amenities: 'Backyard, Parking, Pet Friendly',
    featured: 1
  },
  {
    title: 'High-Rise Luxury Condo',
    description: 'Experience luxury living on the 25th floor. Features floor-to-ceiling windows, premium appliances, and access to a rooftop pool.',
    price: 1500,
    typeName: 'Condo',
    listing_type: 'rent',
    status: 'available',
    approval_status: 'approved',
    bedrooms: 2,
    bathrooms: 2,
    area: 95,
    locCity: 'BKK1',
    agentEmail: 'john.smith@example.com',
    main_image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    amenities: 'Rooftop Pool, Gym, 24/7 Security, Parking',
    featured: 1
  },
  {
    title: 'Riverside Retreat Villa',
    description: 'Escape the city to this peaceful riverside villa. Features a private dock, massive garden, and traditional architectural elements.',
    price: 450000,
    typeName: 'Villa',
    listing_type: 'sale',
    status: 'available',
    approval_status: 'approved',
    bedrooms: 3,
    bathrooms: 3,
    area: 600,
    locCity: 'Kampot Town',
    agentEmail: 'sarah.jenkins@example.com',
    main_image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
    amenities: 'River View, Garden, Boat Dock',
    featured: 0
  },
  {
    title: 'Commercial Office Space',
    description: 'Prime office space ready for your business. Located in a major commercial hub with high foot traffic.',
    price: 2500,
    typeName: 'Office',
    listing_type: 'rent',
    status: 'available',
    approval_status: 'approved',
    bedrooms: 0,
    bathrooms: 2,
    area: 150,
    locCity: 'BKK1',
    agentEmail: 'david.chen@example.com',
    main_image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    amenities: 'Meeting Rooms, High Speed Internet, Reception',
    featured: 0
  },
  {
    title: 'Beachfront Land Plot',
    description: 'Rare opportunity to own beachfront property. Ideal for developing a resort, hotel, or private estate.',
    price: 1200000,
    typeName: 'Land',
    listing_type: 'sale',
    status: 'available',
    approval_status: 'approved',
    bedrooms: 0,
    bathrooms: 0,
    area: 2500,
    locCity: 'Sihanoukville',
    agentEmail: 'john.smith@example.com',
    main_image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    amenities: 'Ocean View, Beach Access',
    featured: 1
  },
  {
    title: 'Minimalist Studio Apartment',
    description: 'Perfect for young professionals. Clean, minimalist design with space-saving furniture included.',
    price: 450,
    typeName: 'Apartment',
    listing_type: 'rent',
    status: 'available',
    approval_status: 'approved',
    bedrooms: 1,
    bathrooms: 1,
    area: 40,
    locCity: 'Toul Kork',
    agentEmail: 'sarah.jenkins@example.com',
    main_image: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80',
    amenities: 'Furnished, Gym, Laundry',
    featured: 0
  }
];

const seedAll = async () => {
  console.log('Starting database seeding...');
  await runMigrations(database);

  // 1. Seed Property Types
  const typeMap = {};
  for (const type of defaultTypes) {
    let row = await database.get('SELECT id, name FROM property_types WHERE name = ?', [type.name]);
    if (!row) {
      const res = await database.run('INSERT INTO property_types (name, description) VALUES (?, ?)', [type.name, type.description]);
      row = { id: res.id, name: type.name };
    }
    typeMap[type.name] = row.id;
  }
  console.log('✓ Property types ready');

  // 2. Seed Locations
  const locMap = {};
  for (const loc of defaultLocations) {
    let row = await database.get('SELECT id, city FROM locations WHERE province = ? AND city = ?', [loc.province, loc.city]);
    if (!row) {
      const res = await database.run('INSERT INTO locations (province, city) VALUES (?, ?)', [loc.province, loc.city]);
      row = { id: res.id, city: loc.city };
    }
    locMap[loc.city] = row.id;
  }
  console.log('✓ Locations ready');

  // 3. Seed Users
  const userMap = {};

  // Admin
  const adminEmail = normalizeEmail(process.env.SEED_ADMIN_EMAIL || 'admin@example.com');
  const adminName = normalizeText(process.env.SEED_ADMIN_NAME || 'System Administrator', 'Admin name', { required: true, max: 100 });
  const adminPass = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';
  validatePassword(adminPass);

  let admin = await database.get('SELECT id, email FROM users WHERE email = ?', [adminEmail]);
  if (!admin) {
    const adminHash = await bcrypt.hash(adminPass, 10);
    const res = await database.run(
      "INSERT INTO users (full_name, email, password, phone, role, status) VALUES (?, ?, ?, ?, 'admin', 'active')",
      [adminName, adminEmail, adminHash, '+85512000001']
    );
    admin = { id: res.id, email: adminEmail };
  }
  userMap[adminEmail] = admin.id;

  // Agents
  const agents = [
    { name: 'John Smith', email: 'john.smith@example.com', phone: '+85512000002' },
    { name: 'Sarah Jenkins', email: 'sarah.jenkins@example.com', phone: '+85512000003' },
    { name: 'David Chen', email: 'david.chen@example.com', phone: '+85512000004' }
  ];

  const agentPassHash = await bcrypt.hash('Agent123!', 10);
  for (const ag of agents) {
    let row = await database.get('SELECT id, email FROM users WHERE email = ?', [ag.email]);
    if (!row) {
      const res = await database.run(
        "INSERT INTO users (full_name, email, password, phone, role, status) VALUES (?, ?, ?, ?, 'agent', 'active')",
        [ag.name, ag.email, agentPassHash, ag.phone]
      );
      row = { id: res.id, email: ag.email };
    }
    userMap[ag.email] = row.id;
  }

  // Customer
  const custEmail = 'customer@example.com';
  let cust = await database.get('SELECT id, email FROM users WHERE email = ?', [custEmail]);
  if (!cust) {
    const custHash = await bcrypt.hash('Customer123!', 10);
    const res = await database.run(
      "INSERT INTO users (full_name, email, password, phone, role, status) VALUES (?, ?, ?, ?, 'customer', 'active')",
      ['Alice Customer', custEmail, custHash, '+85512000005']
    );
    cust = { id: res.id, email: custEmail };
  }
  userMap[custEmail] = cust.id;
  console.log('✓ Users ready (Admin, Agents, Customer)');

  // 4. Seed Properties
  const propCount = await database.get('SELECT COUNT(*) as count FROM properties');
  if (parseInt(propCount?.count || 0, 10) === 0) {
    let inserted = 0;
    for (const p of sampleProperties) {
      const typeId = typeMap[p.typeName] || 1;
      const locId = locMap[p.locCity] || 1;
      const agentId = userMap[p.agentEmail] || admin.id;

      await database.run(
        `INSERT INTO properties (
          title, description, price, property_type_id, listing_type,
          status, approval_status, bedrooms, bathrooms, area, area_unit,
          location_id, agent_id, main_image, amenities, featured
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'sqm', ?, ?, ?, ?, ?)`,
        [
          p.title, p.description, p.price, typeId, p.listing_type,
          p.status, p.approval_status, p.bedrooms, p.bathrooms, p.area,
          locId, agentId, p.main_image, p.amenities, p.featured
        ]
      );
      inserted++;
    }
    console.log(`✓ Successfully seeded ${inserted} properties`);
  } else {
    console.log(`✓ Properties already exist (${propCount.count} found)`);
  }

  console.log('\n=============================================');
  console.log('Seeding completed successfully!');
  console.log('Admin login:    admin@example.com / Admin123!');
  console.log('Agent login:    john.smith@example.com / Agent123!');
  console.log('Customer login: customer@example.com / Customer123!');
  console.log('=============================================\n');
};

seedAll()
  .then(() => database.close())
  .catch((err) => {
    console.error('Seed error:', err);
    process.exitCode = 1;
  });
