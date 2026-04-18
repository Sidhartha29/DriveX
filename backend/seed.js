import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import User from './models/User.js';
import Bus from './models/Bus.js';
import Driver from './models/Driver.js';
import Booking from './models/Booking.js';

dotenv.config();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableMongoError = (error) => {
  const message = String(error?.message || '').toLowerCase();
  return (
    message.includes('connection pool') ||
    message.includes('tlsv1 alert') ||
    message.includes('network') ||
    message.includes('timed out') ||
    message.includes('topology')
  );
};

const withRetry = async (operation, label, maxAttempts = 5) => {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const retryable = isRetryableMongoError(error);

      if (!retryable || attempt === maxAttempts) {
        throw error;
      }

      const waitMs = Math.min(4000, attempt * 1000);
      console.warn(`⚠️ ${label} failed (attempt ${attempt}/${maxAttempts}): ${error.message}`);
      console.warn(`🔁 Retrying in ${waitMs}ms...`);
      await sleep(waitMs);
    }
  }

  throw lastError;
};

const upsertMany = async (Model, docs, keyField) => {
  await Model.bulkWrite(
    docs.map((doc) => ({
      updateOne: {
        filter: { [keyField]: doc[keyField] },
        update: { $set: doc },
        upsert: true
      }
    })),
    { ordered: false }
  );

  const keys = docs.map((doc) => doc[keyField]);
  const existing = await Model.find({ [keyField]: { $in: keys } });
  const docMap = new Map(existing.map((doc) => [doc[keyField], doc]));
  return docs.map((doc) => docMap.get(doc[keyField]));
};

// Connect to MongoDB
const connectDB = async () => {
  const maxAttempts = 5;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        family: 4
      });
      console.log('✅ MongoDB connected for seeding');
      return;
    } catch (error) {
      const waitMs = Math.min(5000, attempt * 1000);
      console.error(`❌ MongoDB connection failed (attempt ${attempt}/${maxAttempts}):`, error.message);

      if (attempt === maxAttempts) {
        process.exit(1);
      }

      await sleep(waitMs);
    }
  }
};

// Demo data
const seedDatabase = async () => {
  try {
    // Clear existing data
    await withRetry(() => User.deleteMany({}), 'Clear users');
    await withRetry(() => Bus.deleteMany({}), 'Clear buses');
    await withRetry(() => Driver.deleteMany({}), 'Clear drivers');
    await withRetry(() => Booking.deleteMany({}), 'Clear bookings');
    console.log('🗑️  Cleared existing data');

    // ============================================
    // 1. CREATE DEMO USERS
    // ============================================

    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
    const seedAdminPassword = process.env.SEED_ADMIN_PASSWORD || process.env.ADMIN_PANEL_PASSWORD || 'Admin@123';
    const seedManagerPassword = process.env.SEED_MANAGER_PASSWORD || 'Manager@123';
    const seedCustomerPassword = process.env.SEED_CUSTOMER_PASSWORD || 'Customer@123';
    const seedDriverAccessCode = process.env.SEED_DRIVER_ACCESS_CODE || 'Driver@123';

    const hashedAdminPassword = await bcryptjs.hash(seedAdminPassword, saltRounds);
    const hashedManagerPassword = await bcryptjs.hash(seedManagerPassword, saltRounds);
    const hashedCustomerPassword = await bcryptjs.hash(seedCustomerPassword, saltRounds);
    const hashedDriverAccessCode = await bcryptjs.hash(seedDriverAccessCode, saltRounds);

    const demoUsers = [
      // Admin users
      {
        name: 'Admin User',
        email: 'admin@drivex.com',
        password: hashedAdminPassword,
        role: 'admin',
        phone: '9876543210',
        isActive: true
      },
      // Manager users
      {
        name: 'Manager Rajesh',
        email: 'manager1@drivex.com',
        password: hashedManagerPassword,
        role: 'manager',
        phone: '9876543211',
        isActive: true
      },
      {
        name: 'Manager Priya',
        email: 'manager2@drivex.com',
        password: hashedManagerPassword,
        role: 'manager',
        phone: '9876543212',
        isActive: true
      },
      // Customer users
      {
        name: 'Customer Arjun',
        email: 'customer1@drivex.com',
        password: hashedCustomerPassword,
        role: 'customer',
        phone: '9876543213',
        isActive: true
      },
      {
        name: 'Customer Neha',
        email: 'customer2@drivex.com',
        password: hashedCustomerPassword,
        role: 'customer',
        phone: '9876543214',
        isActive: true
      },
      {
        name: 'Customer Vikram',
        email: 'customer3@drivex.com',
        password: hashedCustomerPassword,
        role: 'customer',
        phone: '9876543215',
        isActive: true
      },
      {
        name: 'Customer Anjali',
        email: 'customer4@drivex.com',
        password: hashedCustomerPassword,
        role: 'customer',
        phone: '9876543216',
        isActive: true
      }
    ];

    const createdUsers = await withRetry(
      () => upsertMany(User, demoUsers, 'email'),
      'Create users'
    );
    console.log(`✅ Created ${createdUsers.length} demo users`);

    // ============================================
    // 2. CREATE DEMO DRIVERS
    // ============================================

    const demoDrivers = [
      {
        name: 'Driver Suresh',
        email: 'suresh.driver@drivex.com',
        phone: '9876500001',
        licenseNumber: 'DL-2023-001',
        accessCode: hashedDriverAccessCode,
        licenseExpiry: new Date('2027-12-31'),
        experience: 5,
        rating: 4.8,
        status: 'active',
        isVerified: true,
        assignedManager: createdUsers[1]._id // Manager Rajesh
      },
      {
        name: 'Driver Mohan',
        email: 'mohan.driver@drivex.com',
        phone: '9876500002',
        licenseNumber: 'DL-2023-002',
        accessCode: hashedDriverAccessCode,
        licenseExpiry: new Date('2027-06-30'),
        experience: 8,
        rating: 4.9,
        status: 'active',
        isVerified: true,
        assignedManager: createdUsers[1]._id
      },
      {
        name: 'Driver Ramesh',
        email: 'ramesh.driver@drivex.com',
        phone: '9876500003',
        licenseNumber: 'DL-2023-003',
        accessCode: hashedDriverAccessCode,
        licenseExpiry: new Date('2027-09-15'),
        experience: 3,
        rating: 4.5,
        status: 'active',
        isVerified: true,
        assignedManager: createdUsers[2]._id // Manager Priya
      },
      {
        name: 'Driver Karthik',
        email: 'karthik.driver@drivex.com',
        phone: '9876500004',
        licenseNumber: 'DL-2023-004',
        accessCode: hashedDriverAccessCode,
        licenseExpiry: new Date('2027-01-20'),
        experience: 6,
        rating: 4.7,
        status: 'active',
        isVerified: true,
        assignedManager: createdUsers[2]._id
      }
    ];

    const createdDrivers = await withRetry(
      () => upsertMany(Driver, demoDrivers, 'email'),
      'Create drivers'
    );
    console.log(`✅ Created ${createdDrivers.length} demo drivers`);

    // ============================================
    // 3. CREATE DEMO BUSES
    // ============================================

    // Helper function to calculate distance between two coordinates using Haversine formula
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Earth's radius in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return Math.round(R * c);
    };

    // All Indian cities for bus generation
    const allCities = [
      { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
      { name: 'Delhi', lat: 28.7041, lng: 77.1025 },
      { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
      { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
      { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
      { name: 'Pune', lat: 18.5204, lng: 73.8567 },
      { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
      { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
      { name: 'Vijayawada', lat: 16.5062, lng: 80.6480 },
      { name: 'Visakhapatnam', lat: 17.6869, lng: 83.2185 },
      { name: 'Coimbatore', lat: 11.0026, lng: 76.7118 },
      { name: 'Lucknow', lat: 26.8467, lng: 80.9462 },
      { name: 'Surat', lat: 21.1702, lng: 72.8311 },
      { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
      { name: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
      { name: 'Indore', lat: 22.7196, lng: 75.8577 },
      { name: 'Guntur', lat: 16.3867, lng: 80.4277 },
      { name: 'Warangal', lat: 17.9689, lng: 79.5941 },
      { name: 'Tirupati', lat: 13.1939, lng: 79.8471 },
      { name: 'Salem', lat: 11.6643, lng: 78.1460 },
      { name: 'Madurai', lat: 9.9252, lng: 78.1198 },
      { name: 'Kota', lat: 25.2138, lng: 75.8648 },
      { name: 'Udaipur', lat: 24.5854, lng: 73.7125 },
      { name: 'Pushkar', lat: 26.4923, lng: 74.5523 },
      { name: 'Nashik', lat: 19.9975, lng: 73.7898 },
      { name: 'Nagpur', lat: 21.1458, lng: 79.0882 },
      { name: 'Aurangabad', lat: 19.8762, lng: 75.3433 },
      { name: 'Belagavi', lat: 15.8497, lng: 74.4977 },
      { name: 'Mysore', lat: 12.2958, lng: 76.6394 },
      { name: 'Mangalore', lat: 12.8628, lng: 74.8455 },
      { name: 'Thiruvananthapuram', lat: 8.5241, lng: 76.9366 },
      { name: 'Kochi', lat: 9.9312, lng: 76.2673 },
      { name: 'Thrissur', lat: 10.5276, lng: 76.2144 },
      { name: 'Bhubaneswar', lat: 20.2961, lng: 85.8245 },
      { name: 'Raipur', lat: 21.2514, lng: 81.6296 },
      { name: 'Deoria', lat: 25.8661, lng: 84.0618 }
    ];

    const operators = [
      'VRL', 'APSRTC', 'TSRTC', 'Kallada Travels', 'Paulo Travels', 'Orange Tours',
      'Ashok Travels', 'Neeta Express', 'Redbus', 'GoIbibo', 'SRS Travels', 'BusiBus',
      'NSE Tours', 'Shrinath Tours', 'Skyway Tours'
    ];

    const busTypes = ['AC Sleeper', 'AC Semi Sleeper', 'AC Seater', 'Non-AC'];
    const amenitiesOptions = [
      ['WiFi', 'USB Charging', 'Blanket', 'Pillow'],
      ['WiFi', 'AC'],
      ['WiFi', 'Reading Light', 'Power Outlet'],
      ['WiFi', 'USB Charging', 'Blanket', 'Mineral Water'],
      ['Fan', 'Water'],
      ['AC', 'Charging', 'Water'],
      ['WiFi', 'Charging', 'Snacks'],
      ['AC', 'Snacks', 'Water'],
    ];

    const departureTimes = [
      '06:00', '06:30', '07:00', '07:30', '08:00', '08:45', '09:00', '09:30', '09:45', '10:00',
      '11:15', '15:45', '17:00', '17:40', '18:15', '19:00', '19:15', '19:30', '20:00', '20:30',
      '21:30', '21:45', '22:00', '22:30', '23:00', '23:15'
    ];

    // Generate buses for all city pairs
    const demoBuses = [];
    let busCounter = 1;

    for (let i = 0; i < allCities.length; i++) {
      const sourceCity = allCities[i];

      // Generate at least one bus for every source -> destination pair.
      for (let j = 0; j < allCities.length; j++) {
        if (i === j) continue;

        const destCity = allCities[j];
        const distance = calculateDistance(sourceCity.lat, sourceCity.lng, destCity.lat, destCity.lng);
        const depTimeIndex = Math.floor(Math.random() * departureTimes.length);
        const departureTime = departureTimes[depTimeIndex];
        const hours = Math.ceil(distance / 50); // Assuming avg 50 km/hr
        const depHour = parseInt(departureTime.split(':')[0]);
        const depMin = parseInt(departureTime.split(':')[1]);
        const arrivalMinutes = depHour * 60 + depMin + hours * 60;
        const arrivalHour = Math.floor((arrivalMinutes % 1440) / 60);
        const arrivalMin = arrivalMinutes % 60;
        const arrivalTime =
          String(arrivalHour).padStart(2, '0') +
          ':' +
          String(arrivalMin).padStart(2, '0');

        const operator = operators[Math.floor(Math.random() * operators.length)];
        const busType = busTypes[Math.floor(Math.random() * busTypes.length)];
        const totalSeats = busType === 'AC Seater' ? 60 : busType === 'AC Sleeper' ? 42 : 45;
        const managerId = createdUsers[[1, 2][Math.floor(Math.random() * 2)]]._id;
        const driverId = createdDrivers[Math.floor(Math.random() * createdDrivers.length)]._id;
        const amenities = amenitiesOptions[Math.floor(Math.random() * amenitiesOptions.length)];
        const pricePerKm = busType === 'Non-AC' ? 0.55 : busType === 'AC Seater' ? 0.68 : 0.85;
        const rating = (Math.random() * 0.9 + 3.8).toFixed(1); // 3.8-4.7
        const bookedSeats = [];
        const numBooked = Math.floor(Math.random() * 5) + 1;
        for (let k = 0; k < numBooked; k++) {
          bookedSeats.push(Math.floor(Math.random() * totalSeats) + 1);
        }

        demoBuses.push({
          busName: `${operator} ${sourceCity.name}-${destCity.name} ${busCounter}`,
          operator,
          busType,
          from: sourceCity.name,
          to: destCity.name,
          distance,
          departureTime,
          arrivalTime,
          totalSeats,
          bookedSeats: [...new Set(bookedSeats)], // Remove duplicates
          pricePerKm,
          amenities,
          managerId,
          driverId,
          isActive: true,
          rating: parseFloat(rating)
        });

        busCounter++;
      }
    }



    const createdBuses = await withRetry(
      () => upsertMany(Bus, demoBuses, 'busName'),
      'Create buses'
    );
    console.log(`✅ Created ${createdBuses.length} demo buses`);

    // ============================================
    // 4. CREATE DEMO BOOKINGS
    // ============================================

    const demoBookings = [
      {
        bookingId: 'SB-' + Math.random().toString(36).substring(7).toUpperCase(),
        userId: createdUsers[3]._id, // Customer Arjun
        busId: createdBuses[0]._id,
        seats: [4, 5],
        passengerDetails: [
          { name: 'Arjun Kumar', email: 'arjun@example.com', phone: '9876543213', age: 28, gender: 'Male' },
          { name: 'Divya Sharma', email: 'divya@example.com', phone: '9876543217', age: 26, gender: 'Female' }
        ],
        travelDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        totalPrice: 1140 * 2, // 2 seats
        qrCode: 'data:image/png;base64,sample_qr_code',
        paymentStatus: 'completed',
        status: 'confirmed'
      },
      {
        bookingId: 'SB-' + Math.random().toString(36).substring(7).toUpperCase(),
        userId: createdUsers[4]._id, // Customer Neha
        busId: createdBuses[1]._id,
        seats: [12, 13, 14],
        passengerDetails: [
          { name: 'Neha Singh', email: 'neha@example.com', phone: '9876543214', age: 24, gender: 'Female' },
          { name: 'Ravi Singh', email: 'ravi@example.com', phone: '9876543218', age: 26, gender: 'Male' },
          { name: 'Pooja Singh', email: 'pooja@example.com', phone: '9876543219', age: 22, gender: 'Female' }
        ],
        travelDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        totalPrice: 112.5 * 3, // 3 seats
        qrCode: 'data:image/png;base64,sample_qr_code',
        paymentStatus: 'completed',
        status: 'confirmed'
      },
      {
        bookingId: 'SB-' + Math.random().toString(36).substring(7).toUpperCase(),
        userId: createdUsers[5]._id, // Customer Vikram
        busId: createdBuses[2]._id,
        seats: [20, 21],
        passengerDetails: [
          { name: 'Vikram Pandey', email: 'vikram@example.com', phone: '9876543215', age: 30, gender: 'Male' },
          { name: 'Sunita Pandey', email: 'sunita@example.com', phone: '9876543220', age: 28, gender: 'Female' }
        ],
        travelDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        totalPrice: 227.5 * 2, // 2 seats
        qrCode: 'data:image/png;base64,sample_qr_code',
        paymentStatus: 'pending',
        status: 'confirmed'
      },
      {
        bookingId: 'SB-' + Math.random().toString(36).substring(7).toUpperCase(),
        userId: createdUsers[6]._id, // Customer Anjali
        busId: createdBuses[3]._id,
        seats: [11],
        passengerDetails: [
          { name: 'Anjali Verma', email: 'anjali@example.com', phone: '9876543216', age: 25, gender: 'Female' }
        ],
        travelDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        totalPrice: 320,
        qrCode: 'data:image/png;base64,sample_qr_code',
        paymentStatus: 'completed',
        status: 'confirmed'
      }
    ];

    const createdBookings = await withRetry(
      () => upsertMany(Booking, demoBookings, 'bookingId'),
      'Create bookings'
    );
    console.log(`✅ Created ${createdBookings.length} demo bookings`);

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n');
    console.log('╔════════════════════════════════════════╗');
    console.log('║        📊 DATABASE SEEDING COMPLETE     ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('\n📌 DEMO CREDENTIALS (environment-provided or generated for this run):\n');
    console.log('👤 ADMIN:');
    console.log('   Email: admin@drivex.com');
    console.log(`   Password: ${seedAdminPassword}\n`);
    console.log('👔 MANAGER:');
    console.log('   Email: manager1@drivex.com');
    console.log(`   Password: ${seedManagerPassword}\n`);
    console.log('👥 CUSTOMER:');
    console.log('   Email: customer1@drivex.com');
    console.log(`   Password: ${seedCustomerPassword}\n`);
    console.log('🚍 DRIVER:');
    console.log('   Email: suresh.driver@drivex.com');
    console.log(`   Access Code: ${seedDriverAccessCode}\n`);
    console.log('📊 DATA SUMMARY:');
    console.log(`   ✅ Users: ${createdUsers.length}`);
    console.log(`   ✅ Drivers: ${createdDrivers.length}`);
    console.log(`   ✅ Buses: ${createdBuses.length}`);
    console.log(`   ✅ Bookings: ${createdBookings.length}`);
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

// Run seeding
connectDB().then(() => seedDatabase());
