const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User.model');
const Form = require('./src/models/Form.model');
const FormVersion = require('./src/models/FormVersion.model');

dotenv.config();

const checkDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mindscall');
    console.log('MongoDB connected...');

    const users = await User.find({}, '_id name email role');
    console.log('\n--- USERS ---');
    console.log(users);

    const forms = await Form.find({});
    console.log('\n--- FORMS ---');
    console.log(forms);

    const versions = await FormVersion.find({});
    console.log('\n--- FORM VERSIONS ---');
    console.log(versions);

    process.exit(0);
  } catch (err) {
    console.error('Error querying DB:', err);
    process.exit(1);
  }
};

checkDB();
