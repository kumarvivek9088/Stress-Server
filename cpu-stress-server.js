const express = require('express');
const app = express();
const port = 3000;

// Function to stress CPU with heavy calculations
function stressCPU(duration) {
  console.log(`Starting CPU stress test for ${duration} milliseconds...`);
  
  const startTime = Date.now();
  // Run until the specified duration has elapsed
  while (Date.now() - startTime < duration) {
    // Perform computationally intensive operations
    for (let i = 0; i < 1000000; i++) {
      Math.sqrt(i) * Math.random() * Math.cos(i);
    }
  }
  
  console.log('CPU stress test completed');
  return { status: 'completed', duration: duration };
}

// Root endpoint - just for health check
app.get('/', (req, res) => {
  res.send('CPU Stress Server is running. Use /stress endpoint to trigger high CPU usage.');
});

// Stress endpoint to trigger high CPU usage
app.get('/stress', (req, res) => {
  // Get duration from query parameter or use default of 30 seconds
  const duration = parseInt(req.query.duration || 30000);
  
  // Limit duration to max 5 minutes to prevent abuse
  const safeDuration = Math.min(duration, 300000);
  
  console.log(`Received request to stress CPU for ${safeDuration} milliseconds`);
  
  // Start CPU stress in background
  setTimeout(() => {
    stressCPU(safeDuration);
  }, 100);
  
  // Respond immediately without waiting for the stress test to complete
  res.json({
    message: `CPU stress initiated for ${safeDuration} milliseconds`,
    note: 'This will attempt to push CPU utilization above 70%'
  });
});

// Error endpoint - intentionally causes server error
app.get('/error', (req, res) => {
  console.log('Received request to intentionally trigger a server error');
  
  // Simulate a database connection error
  const databaseError = new Error('ECONNREFUSED: Failed to connect to database at mongodb://localhost:27017/myapp - connection timed out after 30000ms');
  databaseError.name = 'MongoNetworkError';
  databaseError.code = 'ECONNREFUSED';
  databaseError.stack = `MongoNetworkError: failed to connect to server [localhost:27017] on first connect [MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017]
    at Pool.<anonymous> (/home/app/node_modules/mongodb/lib/core/topologies/server.js:438:11)
    at Pool.emit (events.js:314:20)
    at Connection.<anonymous> (/home/app/node_modules/mongodb/lib/core/connection/pool.js:562:14)
    at Object.onceWrapper (events.js:421:26)
    at Connection.emit (events.js:314:20)
    at Socket.<anonymous> (/home/app/node_modules/mongodb/lib/core/connection/connection.js:358:22)
    at Object.onceWrapper (events.js:421:26)
    at Socket.emit (events.js:314:20)
    at emitErrorNT (internal/streams/destroy.js:92:8)
    at emitErrorAndCloseNT (internal/streams/destroy.js:60:3)`;
  
  throw databaseError;
  
  // This code will never execute
  res.json({
    message: 'You should never see this message'
  });
});

// Start the server
app.listen(port, () => {
  console.log(`CPU stress server listening on port ${port}`);
  console.log('Available routes:');
  console.log('  - GET /: Health check');
  console.log('  - GET /stress?duration=30000: Trigger CPU stress (duration in milliseconds, default: 30000, max: 300000)');
  console.log('  - GET /error: Intentionally trigger a server error');
}); 