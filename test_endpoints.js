const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

const endpoints = [
  'https://olive-alpaca-121063.hostingersite.com/api/login',
  'https://olive-alpaca-121063.hostingersite.com/api/dashboard',
  'https://olive-alpaca-121063.hostingersite.com/api/parties',
  'https://olive-alpaca-121063.hostingersite.com/api/items',
  'https://olive-alpaca-121063.hostingersite.com/api/orders'
];

endpoints.forEach(ep => {
  const url = new URL(ep);
  const req = https.get({
    hostname: url.hostname,
    path: url.pathname,
    agent: agent,
    timeout: 10000
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('\n=== ' + ep + ' ===');
      console.log('Status: ' + res.statusCode);
      console.log('Content-Type: ' + (res.headers['content-type'] || 'N/A'));
      console.log('Response Length: ' + data.length + ' bytes');
      console.log('Preview: ' + data.substring(0, 200));
    });
  }).on('error', (err) => {
    console.log('\n=== ' + ep + ' ===');
    console.log('Error: ' + err.message);
  });
});
