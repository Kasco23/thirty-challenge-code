const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const unzipper = require('unzipper');
const fs = require('fs-extra');
const madge = require('madge');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Set up rate limiter: max 20 requests per 15 minutes per IP
const dependenciesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  standardHeaders: true, // Return rate limit info in the RateLimit-* headers
  legacyHeaders: false, // Disable the X-RateLimit-* headers
});

const REPO_ZIP_URL = 'https://github.com/Kasco23/thirty-challenge/archive/refs/heads/main.zip';

app.get('/dependencies', dependenciesLimiter, async (req, res) => {
  const file = req.query.path;
  if (!file) return res.status(400).json({ error: 'Missing ?path' });

  const tempDir = path.join(os.tmpdir(), `repo-${uuidv4()}`);
  try {
    // Step 1: Download the repo ZIP
    const zipResponse = await axios({
      method: 'GET',
      url: REPO_ZIP_URL,
      responseType: 'stream'
    });

    // Step 2: Extract the ZIP
    await fs.ensureDir(tempDir);
    await new Promise((resolve, reject) => {
      zipResponse.data
        .pipe(unzipper.Extract({ path: tempDir }))
        .on('close', resolve)
        .on('error', reject);
    });

    // Repo usually extracted to: thirty-challenge-main/
    const repoPath = path.join(tempDir, 'thirty-challenge-main');

    // Step 3: Analyze with madge
    const dependencyGraph = await madge(repoPath, { includeNpm: false });
    const deps = dependencyGraph.obj();

    // Normalize slashes and file paths
    const requestedFile = file.replace(/^\.?\//, '');
    const dependencies = deps[requestedFile] || [];

    const importedBy = Object.entries(deps)
      .filter(([_, imports]) => imports.includes(requestedFile))
      .map(([importer]) => importer);

    res.json({
      file: requestedFile,
      dependencies,
      importedBy
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to analyze dependencies' });
  } finally {
    // Clean up temp files
    await fs.remove(tempDir);
  }
})
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});

