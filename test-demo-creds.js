/**
 * Test more mobile credentials - common demo numbers
 */
const axios = require('axios');

const API_DOMAIN = 'https://olive-alpaca-121063.hostingersite.com';
const API_BASE_PATH = '/api';
const BASE_URL = `${API_DOMAIN}${API_BASE_PATH}`;

const testCredentials = [
  { mobile: '9000000000', password: '123456', desc: '9000000000 / 123456' },
  { mobile: '9000000000', password: 'password', desc: '9000000000 / password' },
  { mobile: '9999999999', password: '123456', desc: '9999999999 / 123456' },
  { mobile: '9999999999', password: 'password', desc: '9999999999 / password' },
  { mobile: '8000000000', password: '123456', desc: '8000000000 / 123456' },
  { mobile: '8000000000', password: 'password', desc: '8000000000 / password' },
  { mobile: '7000000000', password: '123456', desc: '7000000000 / 123456' },
  { mobile: '6000000000', password: '123456', desc: '6000000000 / 123456' },
  { mobile: '5000000000', password: '123456', desc: '5000000000 / 123456' },
  { mobile: '1111111111', password: '123456', desc: '1111111111 / 123456' },
  { mobile: '1234567890', password: '1234567890', desc: '1234567890 / 1234567890' },
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
        validateStatus: () => true,
        timeout: 5000
      }
    );

    const token = response.data?.token || response.data?.data?.token || response.data?.data?.data?.token;
    const message = response.data?.message || response.data?.error;
    const statusText = response.status === 200 ? '✅' : '❌';
    
    console.log(`${statusText} [${desc}] Status: ${response.status}`);
    if (message) console.log(`   Message: ${message}`);
    
    if (token) {
      console.log(`   ✅ TOKEN RECEIVED: ${token.substring(0, 40)}...`);
    }
  } catch (error) {
    console.log(`❌ [${desc}] Error: ${error.message}`);
  }
}

async function runTests() {
  console.log('Testing common demo credentials...\n');
  
  for (const cred of testCredentials) {
    await testLogin(cred.mobile, cred.password, cred.desc);
  }
  
  console.log('\nTest complete.');
}

runTests();
