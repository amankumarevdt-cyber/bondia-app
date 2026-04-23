const http = require('http');

const ports = [3000, 5000, 8000, 8080];
let completed = 0;

ports.forEach(port => {
  const req = http.get('http://localhost:' + port + '/', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('\nPort ' + port + ' - Status: ' + res.statusCode);
      console.log('Content-Type: ' + (res.headers['content-type'] || 'N/A'));
      console.log('Response Length: ' + data.length + ' bytes');
      if (data.length < 500) console.log('Response: ' + data);
      completed++;
    });
  }).on('error', (err) => {
    console.log('\nPort ' + port + ' - Error: ' + err.code);
    completed++;
  });
  req.setTimeout(5000);
});
