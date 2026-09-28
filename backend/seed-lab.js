const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const Lab = require('./src/models/Lab.model');
const Equipment = require('./src/models/Equipment.model');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to DB');
  
  // 1. Create a dummy Lab Manager user if not exists, or just use a placeholder ID
  // Assuming 'Developer Admin' is the current logged-in user, we'll just insert a dummy ID
  const labManagerId = new mongoose.Types.ObjectId();
  
  const lab = await Lab.create({
    name: 'Advanced Materials & Pavement Lab',
    location: 'Building A, Ground Floor',
    description: 'Primary testing facility for bitumen and pavement quality.',
    labManager: labManagerId,
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    workingHours: { start: '09:00', end: '18:00' },
    isActive: true
  });
  
  console.log('Created Lab:', lab.name);
  
  await Equipment.create({
    name: 'Dynamic Shear Rheometer (DSR)',
    lab: lab._id,
    serialNumber: 'EQ-DSR-001',
    status: 'AVAILABLE',
    isActive: true
  });
  
  await Equipment.create({
    name: 'Rotational Viscometer',
    lab: lab._id,
    serialNumber: 'EQ-RV-002',
    status: 'AVAILABLE',
    isActive: true
  });
  
  console.log('Created Equipment for Lab');
  process.exit();
}).catch(err => {
  console.error(err);
  process.exit(1);
});
