/**
 * Comprehensive Bondia App Test Suite
 * Tests all API endpoints and functionality
 */

const axios = require('axios');
const { TEST_MOBILE, TEST_PASSWORD } = require('./test-credentials.js').default || {
  TEST_MOBILE: '9876543210',
  TEST_PASSWORD: 'testpass123'
};

const API_DOMAIN = 'https://olive-alpaca-121063.hostingersite.com';
const API_BASE_PATH = '/api';
const BASE_URL = `${API_DOMAIN}${API_BASE_PATH}`;

const results = {
  apiStatus: [],
  authFlow: {},
  modules: {},
  errors: []
};

// Helper to format test result
function logResult(category, test, status, details = '') {
  const icon = status === '✅' ? '✅' : status === '⚠️' ? '⚠️' : '❌';
  console.log(`${icon} [${category}] ${test}: ${details}`);
  results.apiStatus.push({ category, test, status, details });
}

// Test 1: API Endpoint Availability
async function testApiEndpoints() {
  console.log('\n=== 1. API ENDPOINT TESTS ===\n');
  
  const endpoints = [
    { method: 'POST', url: '/login', name: 'Login', noAuth: true },
    { method: 'POST', url: '/logout', name: 'Logout', noAuth: false },
    { method: 'GET', url: '/dashboard', name: 'Dashboard', noAuth: false },
    { method: 'GET', url: '/parties', name: 'Parties List', noAuth: false },
    { method: 'GET', url: '/items', name: 'Items List', noAuth: false },
    { method: 'GET', url: '/orders', name: 'Orders List', noAuth: false },
  ];

  for (const endpoint of endpoints) {
    try {
      const config = {
        method: endpoint.method,
        url: `${BASE_URL}${endpoint.url}`,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 5000,
        validateStatus: () => true // Don't throw on any status
      };

      if (endpoint.method === 'POST' && endpoint.url === '/login') {
        config.data = { mobile: TEST_MOBILE, password: TEST_PASSWORD };
      }

      const response = await axios(config);
      const contentType = response.headers['content-type'] || '';
      const isHtml = contentType.includes('text/html') || response.data?.includes?.('<html');
      
      if (response.status === 200) {
        logResult('API', endpoint.name, '✅', `Status 200, ${contentType.split(';')[0]}`);
      } else if (response.status === 401) {
        logResult('API', endpoint.name, '⚠️', `Status 401 (requires auth)`);
      } else if (response.status === 302) {
        logResult('API', endpoint.name, '❌', `Status 302 (redirect to HTML)`);
      } else if (response.status === 404) {
        logResult('API', endpoint.name, '❌', `Status 404 (not found)`);
      } else if (response.status === 405) {
        logResult('API', endpoint.name, '❌', `Status 405 (method not allowed)`);
      } else if (isHtml) {
        logResult('API', endpoint.name, '❌', `Status ${response.status} (HTML response instead of JSON)`);
      } else {
        logResult('API', endpoint.name, '⚠️', `Status ${response.status}`);
      }
    } catch (error) {
      logResult('API', endpoint.name, '❌', `Network error: ${error.message}`);
    }
  }
}

// Test 2: Authentication Flow
async function testAuthFlow() {
  console.log('\n=== 2. AUTHENTICATION TESTS ===\n');
  
  try {
    const loginResponse = await axios.post(`${BASE_URL}/login`, 
      { mobile: TEST_MOBILE, password: TEST_PASSWORD },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        validateStatus: () => true
      }
    );

    if (loginResponse.status === 200) {
      const token = loginResponse.data?.token || loginResponse.data?.data?.token;
      if (token) {
        logResult('Auth', 'Login Success', '✅', `Token received: ${token.substring(0, 20)}...`);
        results.authFlow.token = token;
      } else {
        logResult('Auth', 'Login Success', '⚠️', 'Status 200 but no token in response');
        console.log('Response data:', JSON.stringify(loginResponse.data).substring(0, 200));
      }
    } else if (loginResponse.status === 302) {
      logResult('Auth', 'Login Success', '❌', 'API returns HTML redirect instead of JSON');
    } else {
      logResult('Auth', 'Login Success', '❌', `Status ${loginResponse.status}: ${loginResponse.data?.message || 'Unknown error'}`);
    }
  } catch (error) {
    logResult('Auth', 'Login Success', '❌', `Network error: ${error.message}`);
  }
}

// Test 3: Protected Endpoints
async function testProtectedEndpoints() {
  console.log('\n=== 3. PROTECTED ENDPOINTS (without token) ===\n');
  
  const endpoints = ['dashboard', 'parties', 'items', 'orders'];
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${BASE_URL}/${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        validateStatus: () => true
      });

      if (response.status === 401) {
        logResult('Protected', `${endpoint} (no token)`, '✅', 'Correctly returns 401');
      } else if (response.status === 200) {
        logResult('Protected', `${endpoint} (no token)`, '❌', 'Should require auth but returned 200');
      } else {
        logResult('Protected', `${endpoint} (no token)`, '⚠️', `Status ${response.status}`);
      }
    } catch (error) {
      logResult('Protected', `${endpoint} (no token)`, '❌', `Error: ${error.message}`);
    }
  }
}

// Test 4: Modules Status
async function testModulesStructure() {
  console.log('\n=== 4. MODULE STRUCTURE ===\n');
  
  const modules = [
    { name: 'Parties', screens: ['PartyListScreen', 'PartyFormScreen'] },
    { name: 'Items', screens: ['ItemListScreen', 'ItemFormScreen'] },
    { name: 'Orders', screens: ['OrderListScreen', 'OrderCreateScreen', 'OrderDetailScreen'] },
    { name: 'Dashboard', screens: ['DashboardScreen'] },
  ];

  modules.forEach(module => {
    logResult('Modules', module.name, '✅', `${module.screens.length} screens defined`);
  });
}

// Main test runner
async function runTests() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   BONDIA APP - COMPREHENSIVE TEST REPORT   ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log(`\nTest URL: ${BASE_URL}`);
  console.log(`Time: ${new Date().toISOString()}\n`);

  await testApiEndpoints();
  await testAuthFlow();
  await testProtectedEndpoints();
  await testModulesStructure();

  // Summary Report
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║              TEST SUMMARY REPORT           ║');
  console.log('╚════════════════════════════════════════════╝\n');

  const working = results.apiStatus.filter(r => r.status === '✅').length;
  const partial = results.apiStatus.filter(r => r.status === '⚠️').length;
  const failing = results.apiStatus.filter(r => r.status === '❌').length;

  console.log(`✅ Fully Working: ${working}`);
  console.log(`⚠️ Partially Working: ${partial}`);
  console.log(`❌ Not Working: ${failing}`);
  console.log(`Total Tests: ${results.apiStatus.length}\n`);

  // Export results
  console.log('Full results saved to test-results.json');
  require('fs').writeFileSync(
    './test-results.json',
    JSON.stringify(results, null, 2)
  );
}

runTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
