const db = require('../config/db');

/**
 * Migration: Create Multi-Modal Travel Tables
 * 
 * This migration creates the necessary tables for multi-modal travel bookings:
 * - travel_packages: Pre-defined package deals (Flight + Hotel + Car)
 * - multi_modal_bookings: User bookings that combine multiple services
 * - package_components: Individual components of a package
 */

const createTravelPackagesTable = `
  CREATE TABLE IF NOT EXISTS travel_packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    destination TEXT NOT NULL,
    origin TEXT NOT NULL,
    duration_days INTEGER NOT NULL,
    base_price REAL NOT NULL,
    discount_percentage REAL DEFAULT 0,
    final_price REAL NOT NULL,
    includes_flight INTEGER DEFAULT 1,
    includes_hotel INTEGER DEFAULT 1,
    includes_car INTEGER DEFAULT 0,
    hotel_name TEXT,
    hotel_rating INTEGER,
    car_type TEXT,
    image_url TEXT,
    is_active INTEGER DEFAULT 1,
    featured INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

const createMultiModalBookingsTable = `
  CREATE TABLE IF NOT EXISTS multi_modal_bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    package_id INTEGER,
    booking_reference TEXT UNIQUE NOT NULL,
    
    -- Flight details
    flight_id INTEGER,
    flight_booking_id INTEGER,
    
    -- Hotel details
    hotel_name TEXT,
    hotel_check_in DATE,
    hotel_check_out DATE,
    hotel_room_type TEXT,
    hotel_price REAL,
    
    -- Car rental details
    car_type TEXT,
    car_pickup_date DATE,
    car_return_date DATE,
    car_price REAL,
    
    -- Pricing
    total_price REAL NOT NULL,
    discount_applied REAL DEFAULT 0,
    final_price REAL NOT NULL,
    
    -- Status
    status TEXT DEFAULT 'pending',
    payment_status TEXT DEFAULT 'pending',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (package_id) REFERENCES travel_packages(id),
    FOREIGN KEY (flight_id) REFERENCES flights(id)
  )
`;

const createPackageComponentsTable = `
  CREATE TABLE IF NOT EXISTS package_components (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    package_id INTEGER NOT NULL,
    component_type TEXT NOT NULL,
    component_name TEXT NOT NULL,
    description TEXT,
    included INTEGER DEFAULT 1,
    price REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (package_id) REFERENCES travel_packages(id)
  )
`;

// Create indexes for better query performance
const createIndexes = [
  `CREATE INDEX IF NOT EXISTS idx_packages_destination ON travel_packages(destination)`,
  `CREATE INDEX IF NOT EXISTS idx_packages_active ON travel_packages(is_active)`,
  `CREATE INDEX IF NOT EXISTS idx_packages_featured ON travel_packages(featured)`,
  `CREATE INDEX IF NOT EXISTS idx_multi_bookings_user ON multi_modal_bookings(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_multi_bookings_reference ON multi_modal_bookings(booking_reference)`,
  `CREATE INDEX IF NOT EXISTS idx_multi_bookings_status ON multi_modal_bookings(status)`,
];

// Sample travel packages
const samplePackages = [
  {
    name: 'Dubai Luxury Escape',
    description: 'Experience the ultimate luxury in Dubai with flights, 5-star hotel, and premium car rental',
    destination: 'Dubai (DXB)',
    origin: 'New York (JFK)',
    duration_days: 7,
    base_price: 2499.00,
    discount_percentage: 15,
    final_price: 2124.15,
    includes_flight: 1,
    includes_hotel: 1,
    includes_car: 1,
    hotel_name: 'Burj Al Arab',
    hotel_rating: 5,
    car_type: 'Luxury Sedan',
    featured: 1,
    image_url: '/images/packages/dubai.jpg'
  },
  {
    name: 'Paris Romance Package',
    description: 'A romantic getaway to the City of Light with flights and boutique hotel',
    destination: 'Paris (CDG)',
    origin: 'New York (JFK)',
    duration_days: 5,
    base_price: 1899.00,
    discount_percentage: 10,
    final_price: 1709.10,
    includes_flight: 1,
    includes_hotel: 1,
    includes_car: 0,
    hotel_name: 'Le Meurice',
    hotel_rating: 5,
    featured: 1,
    image_url: '/images/packages/paris.jpg'
  },
  {
    name: 'Tokyo Adventure',
    description: 'Explore the vibrant culture of Tokyo with flights, hotel, and unlimited metro pass',
    destination: 'Tokyo (NRT)',
    origin: 'Los Angeles (LAX)',
    duration_days: 10,
    base_price: 3299.00,
    discount_percentage: 20,
    final_price: 2639.20,
    includes_flight: 1,
    includes_hotel: 1,
    includes_car: 0,
    hotel_name: 'Park Hyatt Tokyo',
    hotel_rating: 5,
    featured: 1,
    image_url: '/images/packages/tokyo.jpg'
  },
  {
    name: 'Caribbean Beach Retreat',
    description: 'Relax on pristine beaches with all-inclusive resort and flights',
    destination: 'Cancun (CUN)',
    origin: 'Miami (MIA)',
    duration_days: 6,
    base_price: 1599.00,
    discount_percentage: 12,
    final_price: 1407.12,
    includes_flight: 1,
    includes_hotel: 1,
    includes_car: 0,
    hotel_name: 'Excellence Playa Mujeres',
    hotel_rating: 5,
    featured: 1,
    image_url: '/images/packages/cancun.jpg'
  },
  {
    name: 'London Explorer',
    description: 'Discover historic London with flights, central hotel, and car rental',
    destination: 'London (LHR)',
    origin: 'Boston (BOS)',
    duration_days: 8,
    base_price: 2199.00,
    discount_percentage: 18,
    final_price: 1803.18,
    includes_flight: 1,
    includes_hotel: 1,
    includes_car: 1,
    hotel_name: 'The Savoy',
    hotel_rating: 5,
    car_type: 'Compact',
    featured: 1,
    image_url: '/images/packages/london.jpg'
  }
];

async function runMigration() {
  try {
    console.log('🚀 Starting Multi-Modal Travel Tables Migration...');

    // Create tables
    await new Promise((resolve, reject) => {
      db.run(createTravelPackagesTable, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('✅ Created travel_packages table');

    await new Promise((resolve, reject) => {
      db.run(createMultiModalBookingsTable, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('✅ Created multi_modal_bookings table');

    await new Promise((resolve, reject) => {
      db.run(createPackageComponentsTable, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('✅ Created package_components table');

    // Create indexes
    for (const indexQuery of createIndexes) {
      await new Promise((resolve, reject) => {
        db.run(indexQuery, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
    console.log('✅ Created indexes');

    // Insert sample packages
    const insertPackage = `
      INSERT INTO travel_packages (
        name, description, destination, origin, duration_days,
        base_price, discount_percentage, final_price,
        includes_flight, includes_hotel, includes_car,
        hotel_name, hotel_rating, car_type, featured, image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    for (const pkg of samplePackages) {
      await new Promise((resolve, reject) => {
        db.run(
          insertPackage,
          [
            pkg.name, pkg.description, pkg.destination, pkg.origin, pkg.duration_days,
            pkg.base_price, pkg.discount_percentage, pkg.final_price,
            pkg.includes_flight, pkg.includes_hotel, pkg.includes_car,
            pkg.hotel_name, pkg.hotel_rating, pkg.car_type || null, pkg.featured, pkg.image_url
          ],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }
    console.log(`✅ Inserted ${samplePackages.length} sample packages`);

    console.log('🎉 Multi-Modal Travel Tables Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };
