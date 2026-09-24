const jwt = require('jsonwebtoken');

async function testEndpoint() {
  try {
    const token = jwt.sign({ id: '64f0b2f5b4d7e0001cf8a999', email: 'admin@cubetech.com', role: 'SUPER_ADMIN' }, 'your_super_secret_jwt_key_here', { expiresIn: '1d' });
    
    // fetch submissions to get an ID
    const subsRes = await fetch(`http://127.0.0.1:5000/api/v1/admin/submissions`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const subsData = await subsRes.json();
    const sub = subsData.data?.submissions?.[0]; // Just take the first one
    if (!sub) {
        console.log("No submission found");
        return;
    }
    console.log("Found submission:", sub._id);
    
    const res = await fetch(`http://127.0.0.1:5000/api/v1/admin/submissions/${sub._id}/project-details`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            objectives: [ { text: "test", status: "Not Started" } ],
            expectedBenefits: "test",
            actualBenefits: "test"
        })
    });
    if (res.ok) {
        console.log("Success:", await res.json());
    } else {
        console.log("Error Status:", res.status);
        console.log("Error Data:", await res.text());
    }
  } catch (err) {
    console.log("Error:", err.message);
  }
}

testEndpoint();
