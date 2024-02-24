const express = require("express");
const httpProxy = require("http-proxy");

const PORT = 8000;
const app = express();
const proxy = httpProxy.createProxy();


const BASE_PATH = `https://vercel-clone-output-bucket.s3.ap-south-1.amazonaws.com/__output__`

/* Resolve all request on http://subdomain.localhost:8000 to s3 bucket  */ 
app.use((req, res) => {
  const hostName = req.hostname;
  const subDomain = hostName.split(".")[0];
  const resolvesTo = `${BASE_PATH}/${subDomain}`

  return proxy.web(req, res, { target: resolvesTo, changeOrigin: true });
});

/* All request on / resolves to index.html */ 
proxy.on('proxyReq', (proxyReq, req, res) => {
    const url = req.url;
    if (url === '/')
        proxyReq.path += 'index.html'

})

app.listen(PORT, () => console.log(`Revese proxy running on port ${PORT}`));
