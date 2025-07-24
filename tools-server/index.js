const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// ✅ Serve YAML files from gpt-tools/
const yamlPath = path.join(__dirname, '../gpt-tools');
app.use(express.static(yamlPath));

// Optional health check
app.get('/', (req, res) => {
  res.send('✅ GPT Tools Server is running');
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
