const db = require('../config/db');

const newPackages = [
    {
        name: 'Roman Holiday', description: 'Explore the eternal city with flights and central hotel.',
        destination: 'Rome (FCO)', origin: 'New York (JFK)', duration_days: 6,
        base_price: 1800, discount_percentage: 10, final_price: 1620, includes_flight: 1, includes_hotel: 1, includes_car: 0,
        hotel_name: 'Hotel Artemide', hotel_rating: 4, image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800'
    },
    {
        name: 'Barcelona Beach & City', description: 'Enjoy the vibrant culture and beaches of Barcelona.',
        destination: 'Barcelona (BCN)', origin: 'London (LHR)', duration_days: 5,
        base_price: 1200, discount_percentage: 15, final_price: 1020, includes_flight: 1, includes_hotel: 1, includes_car: 0,
        hotel_name: 'W Barcelona', hotel_rating: 5, image_url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800'
    },
    {
        name: 'Amsterdam Canal Tour', description: 'Discover the charm of Amsterdam canals and museums.',
        destination: 'Amsterdam (AMS)', origin: 'Berlin (BER)', duration_days: 4,
        base_price: 900, discount_percentage: 5, final_price: 855, includes_flight: 1, includes_hotel: 1, includes_car: 0,
        hotel_name: 'Pulitzer Amsterdam', hotel_rating: 5, image_url: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800'
    },
    {
        name: 'Bangkok City Light', description: 'Experience the electric energy of Bangkok.',
        destination: 'Bangkok (BKK)', origin: 'Singapore (SIN)', duration_days: 5,
        base_price: 800, discount_percentage: 20, final_price: 640, includes_flight: 1, includes_hotel: 1, includes_car: 0,
        hotel_name: 'Lebua at State Tower', hotel_rating: 5, image_url: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800'
    },
    {
        name: 'Sydney Harbour Escape', description: 'Visit the iconic Opera House and Bondi Beach.',
        destination: 'Sydney (SYD)', origin: 'Los Angeles (LAX)', duration_days: 9,
        base_price: 2500, discount_percentage: 10, final_price: 2250, includes_flight: 1, includes_hotel: 1, includes_car: 1,
        hotel_name: 'Shangri-La Sydney', hotel_rating: 5, car_type: 'SUV', image_url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800'
    },
    {
        name: 'San Francisco Golden Gate', description: 'See the bridge, ride the cable cars.',
        destination: 'San Francisco (SFO)', origin: 'Chicago (ORD)', duration_days: 4,
        base_price: 1100, discount_percentage: 10, final_price: 990, includes_flight: 1, includes_hotel: 1, includes_car: 1,
        hotel_name: 'Fairmont San Francisco', hotel_rating: 5, car_type: 'Convertible', image_url: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800'
    },
    {
        name: 'Rio Carnival Spirit', description: 'Feel the rhythm of Rio de Janeiro.',
        destination: 'Rio de Janeiro (GIG)', origin: 'Miami (MIA)', duration_days: 7,
        base_price: 1600, discount_percentage: 15, final_price: 1360, includes_flight: 1, includes_hotel: 1, includes_car: 0,
        hotel_name: 'Copacabana Palace', hotel_rating: 5, image_url: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800'
    },
    {
        name: 'Cape Town Adventure', description: 'Table Mountain and coastal drives.',
        destination: 'Cape Town (CPT)', origin: 'London (LHR)', duration_days: 8,
        base_price: 2100, discount_percentage: 12, final_price: 1848, includes_flight: 1, includes_hotel: 1, includes_car: 1,
        hotel_name: 'The Silo Hotel', hotel_rating: 5, car_type: 'Jeep', image_url: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800'
    },
    {
        name: 'Iceland Northern Lights', description: 'Chase the Aurora Borealis in style.',
        destination: 'Reykjavik (KEF)', origin: 'New York (JFK)', duration_days: 6,
        base_price: 1900, discount_percentage: 10, final_price: 1710, includes_flight: 1, includes_hotel: 1, includes_car: 1,
        hotel_name: 'ION Adventure Hotel', hotel_rating: 4, car_type: '4x4', image_url: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=800'
    },
    {
        name: 'Istanbul bazaars', description: 'Where East meets West.',
        destination: 'Istanbul (IST)', origin: 'Dubai (DXB)', duration_days: 5,
        base_price: 1300, discount_percentage: 20, final_price: 1040, includes_flight: 1, includes_hotel: 1, includes_car: 0,
        hotel_name: 'Four Seasons Bosphorus', hotel_rating: 5, image_url: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800'
    },
    {
        name: 'Kyoto Cultural Trip', description: 'Temples, shrines, and tea ceremonies.',
        destination: 'Kyoto (KIX)', origin: 'Tokyo (NRT)', duration_days: 5,
        base_price: 1500, discount_percentage: 5, final_price: 1425, includes_flight: 1, includes_hotel: 1, includes_car: 0,
        hotel_name: 'Ritz-Carlton Kyoto', hotel_rating: 5, image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800'
    },
    {
        name: 'Maldives Paradise', description: 'Overwater bungalows and crystal clear water.',
        destination: 'Maldives (MLE)', origin: 'Dubai (DXB)', duration_days: 6,
        base_price: 3500, discount_percentage: 10, final_price: 3150, includes_flight: 1, includes_hotel: 1, includes_car: 0,
        hotel_name: 'Soneva Jani', hotel_rating: 5, image_url: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800'
    },
    {
        name: 'Machu Picchu Trek', description: 'Visit the lost city of the Incas.',
        destination: 'Cusco (CUZ)', origin: 'Lima (LIM)', duration_days: 4,
        base_price: 1400, discount_percentage: 10, final_price: 1260, includes_flight: 1, includes_hotel: 1, includes_car: 0,
        hotel_name: 'Belmond Sanctuary Lodge', hotel_rating: 5, image_url: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800'
    },
    {
        name: 'Santorini Sunset', description: 'White buildings and blue domes.',
        destination: 'Santorini (JTR)', origin: 'Athens (ATH)', duration_days: 4,
        base_price: 1200, discount_percentage: 15, final_price: 1020, includes_flight: 1, includes_hotel: 1, includes_car: 0,
        hotel_name: 'Canaves Oia', hotel_rating: 5, image_url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800'
    },
    {
        name: 'Pyramids of Giza', description: 'Ancient wonders of the world.',
        destination: 'Cairo (CAI)', origin: 'London (LHR)', duration_days: 5,
        base_price: 1100, discount_percentage: 20, final_price: 880, includes_flight: 1, includes_hotel: 1, includes_car: 0,
        hotel_name: 'Marriott Mena House', hotel_rating: 5, image_url: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800'
    },
    {
        name: 'Venice Romantic', description: 'Gondola rides in the floating city.',
        destination: 'Venice (VCE)', origin: 'Paris (CDG)', duration_days: 3,
        base_price: 950, discount_percentage: 10, final_price: 855, includes_flight: 1, includes_hotel: 1, includes_car: 0,
        hotel_name: 'Aman Venice', hotel_rating: 5, image_url: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=800'
    },
    {
        name: 'Singapore Gardens', description: 'Modern city amidst nature.',
        destination: 'Singapore (SIN)', origin: 'Hong Kong (HKG)', duration_days: 4,
        base_price: 1050, discount_percentage: 8, final_price: 966, includes_flight: 1, includes_hotel: 1, includes_car: 0,
        hotel_name: 'Marina Bay Sands', hotel_rating: 5, image_url: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800'
    },
    {
        name: 'Vancouver Nature', description: 'Mountains meets ocean.',
        destination: 'Vancouver (YVR)', origin: 'Seattle (SEA)', duration_days: 5,
        base_price: 950, discount_percentage: 10, final_price: 855, includes_flight: 1, includes_hotel: 1, includes_car: 1,
        hotel_name: 'Fairmont Pacific Rim', hotel_rating: 5, car_type: 'Sedan', image_url: 'https://images.unsplash.com/photo-1559511260-66a654ae98e2?w=800'
    },
    {
        name: 'Marrakech Souks', description: 'Colors and spices of Morocco.',
        destination: 'Marrakech (RAK)', origin: 'Madrid (MAD)', duration_days: 5,
        base_price: 1150, discount_percentage: 15, final_price: 977.5, includes_flight: 1, includes_hotel: 1, includes_car: 0,
        hotel_name: 'Royal Mansour', hotel_rating: 5, image_url: 'https://images.unsplash.com/photo-1597211684565-dca64c72c7f2?w=800'
    },
    {
        name: 'Aloha Hawaii', description: 'Surf and sun in Honolulu.',
        destination: 'Honolulu (HNL)', origin: 'San Francisco (SFO)', duration_days: 7,
        base_price: 2200, discount_percentage: 10, final_price: 1980, includes_flight: 1, includes_hotel: 1, includes_car: 1,
        hotel_name: 'Halekulani', hotel_rating: 5, car_type: 'Jeep Wrangler', image_url: 'https://images.unsplash.com/photo-1542259659439-d4fd13bc44cf?w=800'
    }
];

const run = () => {
    console.log("Inserting 20 new packages...");
    db.serialize(() => {
        let completed = 0;
        const stmt = db.prepare(`
            INSERT INTO travel_packages (
                name, description, destination, origin, duration_days,
                base_price, discount_percentage, final_price,
                includes_flight, includes_hotel, includes_car,
                hotel_name, hotel_rating, car_type, image_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        newPackages.forEach(p => {
            stmt.run([
                p.name, p.description, p.destination, p.origin, p.duration_days,
                p.base_price, p.discount_percentage, p.final_price,
                p.includes_flight, p.includes_hotel, p.includes_car,
                p.hotel_name, p.hotel_rating, p.car_type || null, p.image_url
            ], function(err) {
                if(err) console.error("Error inserting " + p.name, err);
                else {
                    // console.log("Inserted " + p.name);
                }
                completed++;
                if(completed === newPackages.length) {
                    console.log("✅ All 20 packages inserted.");
                }
            });
        });
        stmt.finalize();
    });
};

run();
