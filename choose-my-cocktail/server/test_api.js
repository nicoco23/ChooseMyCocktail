const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/recipes',
  method: 'GET',
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log("Data length:", json.data ? json.data.length : 0);
      if (json.data && json.data.length > 0) {
          console.log("First recipe:", json.data[0].name, "Category:", json.data[0].category);
      } else {
          console.log("No data returned.");
          console.log("Full response:", data);
      }
    } catch (e) {
      console.error("Error parsing JSON:", e);
      console.log("Raw data:", data);
    }
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
