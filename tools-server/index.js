const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Serve .yaml files statically from gpt-tools/
const yamlDirectory = path.join(__dirname, '../gpt-tools');
app.use(express.static(yamlDirectory));

// Optional: Health check
app.get('/', (req, res) => {
  res.send('GPT Tools API Server is running ✅');
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
