const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

const loginUrl = 'https://olive-alpaca-121063.hostingersite.com/api/login';
const url = new URL(loginUrl);

const postData = JSON.stringify({ username: 'test', password: 'test' });

const options = {
  hostname: url.hostname,
  path: url.pathname,
  method: 'POST',
  agent: agent,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('=== POST /api/login - Full Response ===');
    console.log('Status Code: ' + res.statusCode);
    console.log('Headers:');
    Object.keys(res.headers).forEach(key => {
      console.log('  ' + key + ': ' + res.headers[key]);
    });
    console.log('Response Body Length: ' + data.length + ' bytes');
    console.log('Is HTML: ' + (data.includes('<!DOCTYPE') ? 'Yes' : 'No'));
  });
});

req.on('error', (err) => {
  console.log('Error: ' + err.message);
});

req.write(postData);
req.end();
