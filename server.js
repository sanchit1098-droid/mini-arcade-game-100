const express = require('express');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

// Serve static assets from repository root with directory trailing-slash redirect
app.use(express.static(__dirname, {
  index: 'index.html',
  redirect: true,
}));

// Fallback to index.html for unknown routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Mini Game Arcade server listening on http://${HOST}:${PORT}`);
});
