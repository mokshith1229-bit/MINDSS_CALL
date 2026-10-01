const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testSubmit() {
  try {
    const form = new FormData();
    form.append('answers', JSON.stringify({
      title: 'S3 Upload Test',
      description: 'Testing the multer-s3 upload endpoint',
      submissionType: 'Idea',
      employeeName: 'S3 Tester',
      officialEmail: 'test@chtech.in'
    }));

    // Create a dummy file
    const dummyPath = path.join(__dirname, 'dummy.txt');
    fs.writeFileSync(dummyPath, 'Hello S3 World!');
    
    form.append('files', fs.createReadStream(dummyPath));

    console.log('Sending request to /api/v1/public/forms/new-test/submit...');
    
    const response = await axios.post('http://localhost:5000/api/v1/public/forms/new-test/submit', form, {
      headers: {
        ...form.getHeaders()
      }
    });

    console.log('✅ Success:', response.data);
    fs.unlinkSync(dummyPath);
  } catch (error) {
    console.error('❌ Error response:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
    
    // Clean up
    const dummyPath = path.join(__dirname, 'dummy.txt');
    if (fs.existsSync(dummyPath)) fs.unlinkSync(dummyPath);
  }
}

testSubmit();
