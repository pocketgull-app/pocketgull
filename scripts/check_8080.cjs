const http = require('http');

http.get('http://localhost:8080', res => {
  console.log('HTTP 8080 Status:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Bytes received:', data.length);
    console.log('Has #stageTitle:', data.indexOf('id="stageTitle"') !== -1);
    console.log('Has #global-health:', data.indexOf('id="global-health"') !== -1);
    console.log('Has #enterprise-roi:', data.indexOf('id="enterprise-roi"') !== -1);
  });
});
