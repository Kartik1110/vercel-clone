const express = require("express");
const httpProxy = require("http-proxy");

const PORT = 8000;
const app = express();

app.use((req, res) => {
  const hostName = req.hostname;
  const subDomain = hostName.split(".")[0];

  const resolvesTo = ''
});

app.listen(PORT, () => `Revese proxy running on port ${PORT}`);
