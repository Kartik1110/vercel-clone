const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const mime = require("mime-types");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const dotenv = require("dotenv");
const Redis = require("ioredis");

dotenv.config();

const PROJECT_ID = process.env.PROJECT_ID;
const REDIS_URI = "";

/* Initializing redis publisher */
const publisher = new Redis(REDIS_URI);

/* Initializing S3 Client */
const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

/**
 * Publishes a log to the Redis pub/sub channel for the current project.
 * @param {object} log - The log object to publish.
 */
function publishLog(log) {
  publisher.publish(`logs:${PROJECT_ID}`, log);
}

async function init() {
  publishLog("🛠️  Build started...");
  const outDir = path.join(__dirname, "output");

  /* Running build command */
  const p = exec(`cd ${outDir} && npm install && npm run build`);

  p.stdout.on("data", function (data) {
    publishLog(data.toString());
    console.log(data.toString());
  });

  p.stdout.on("error", function (data) {
    publishLog("❗ Error", data.toString());
    console.log("❗ Error", data.toString());
  });

  p.on("close", async function () {
    publishLog("🛠️  Build complete!");
    console.log("🛠️  Build complete!");

    const distFolderPath = path.join(__dirname, "output", "dist");
    const distFolderContent = fs.readdirSync(distFolderPath, { recursive: true });

    publishLog("⏳ Uploading started ...");
    console.log("⏳ Uploading started ...");

    /* Uploading each file to S3 */
    for (const file of distFolderContent) {
      const filePath = path.join(distFolderPath, file);

      if (fs.lstatSync(filePath).isDirectory()) continue;

      const command = new PutObjectCommand({
        // Bucket: process.env.S3_BUCKET,
        Bucket: "vercel-clone-output-bucket",
        Key: `__output__/${PROJECT_ID}/${file}`,
        Body: fs.createReadStream(filePath),
        ContentType: mime.lookup(filePath),
      });

      await s3Client.send(command);

      publishLog(`Uploaded ${file} ...`);
      console.log(`Uploaded ${file} ...`);
    }

    publishLog("🚀 Deployment complete!");
    console.log("🚀 Deployment complete!");

    /* Disconnect redis which will stop the task when completed */ 
    publisher.disconnect();
  });
}

init();
