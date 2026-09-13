// Root server entry point for Cloud Run / Production and full-stack runtime
const { server } = require('./backend/src/server.js');
const PORT = 3000;

if (!server.listening) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`📡 DUOCORE Server running on http://localhost:${PORT}`);
  });
}

module.exports = server;
