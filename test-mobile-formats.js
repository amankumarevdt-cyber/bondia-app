/**
 * Test different mobile number formats
 */
const axios = require('axios');

const API_DOMAIN = 'https://olive-alpaca-121063.hostingersite.com';
const API_BASE_PATH = '/api';
const BASE_URL = `${API_DOMAIN}${API_BASE_PATH}`;

const testCredentials = [
  { mobile: '9876543210', password: 'testpass123', desc: '10 digits' },
  { mobile: '+919876543210', password: 'testpass123', desc: '10 digits with +91' },
  { mobile: '919876543210', password: 'testpass123', desc: '12 digits with 91' },
  { mobile: '1234567890', password: 'testpass123', desc: '10 digits generic' },
  { mobile: '9000000000', password: 'testpass123', desc: '9000000000' },
  { mobile: '8888888888', password: 'testpass123', desc: '8888888888' },
  { mobile: 'admin', password: 'admin', desc: 'admin/admin' },
  { mobile: 'test', password: 'test123', desc: 'test/test123' },
  { mobile: '9000000001', password: 'password', desc: '9000000001/password' },
];

async function testLogin(mobile, password, desc) {
  try {
    const response = await axios.post(`${BASE_URL}/login`, 
      { mobile, password },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        validateStatus: () => true
      }
    );

    const token = response.data?.token || response.data?.data?.token;
    const message = response.data?.message || response.data?.error;
    const statusText = response.status === 200 ? '✅' : '❌';
    
    console.log(`${statusText} [${desc}] Status: ${response.status}, Message: ${message || 'Success'}`);
    
    if (token) {
      console.log(`   Token: ${token.substring(0, 30)}...`);
    }
  } catch (error) {
    console.log(`❌ [${desc}] Error: ${error.message}`);
  }
}

async function runTests() {
  console.log('Testing different mobile credentials...\n');
  
  for (const cred of testCredentials) {
    await testLogin(cred.mobile, cred.password, cred.desc);
  }
  
  console.log('\nTest complete.');
}

runTests();
