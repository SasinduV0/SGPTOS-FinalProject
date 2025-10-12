// Test script to verify real-time updates
const axios = require('axios');

const API_BASE = 'http://localhost:8000/api';

async function testRealTimeUpdates() {
  console.log('🧪 Testing Real-time Updates...\n');

  try {
    // 1. Get current employees
    console.log('1️⃣ Fetching current employees...');
    const { data: employees } = await axios.get(`${API_BASE}/employees`);
    console.log(`   Found ${employees.length} employees\n`);

    if (employees.length > 0) {
      // 2. Update first employee's PCS
      const firstEmployee = employees[0];
      const newPcs = (firstEmployee.pcs || 0) + 10;
      
      console.log(`2️⃣ Updating ${firstEmployee.name}'s PCS from ${firstEmployee.pcs} to ${newPcs}...`);
      
      const response = await axios.patch(
        `${API_BASE}/employees/${firstEmployee._id}/pcs`,
        { pcs: newPcs }
      );
      
      console.log(`   ✅ Updated successfully!`);
      console.log(`   📡 Real-time event should have been emitted to frontend\n`);
    } else {
      // 3. Create a test employee
      console.log('3️⃣ Creating test employee...');
      const newEmployee = {
        name: 'Test Employee',
        line: 1,
        pcs: 50
      };
      
      const response = await axios.post(`${API_BASE}/employees`, newEmployee);
      console.log(`   ✅ Created: ${response.data.name}`);
      console.log(`   📡 Real-time event should have been emitted to frontend\n`);
    }

    console.log('🎉 Test completed! Check your frontend dashboard for real-time updates.');
    console.log('💡 If updates don\'t appear, check browser console for Socket.IO messages.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
  }
}

// Run the test
testRealTimeUpdates();