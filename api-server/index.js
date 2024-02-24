const express = require("express");
const { generateSlug } = require("random-word-slugs");
const { ECSClient, RunTaskCommand } = require("@aws-sdk/client-ecs");
const dotenv = require("dotenv");

dotenv.config();

const PORT = 9000;
const app = express();

app.use(express.json());

/* Creating ECS client */
const ecsClient = new ECSClient({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

/* Task runner config */ 
const config = {
  CLUSTER: "",
  TASK: "",
};

app.post("/api/project", async (req, res) => {
  const { gitURL } = req.body;
  /* Random project slug */
  const projectSlug = generateSlug();

  /* Create ECS command */
  const command = new RunTaskCommand({
    cluster: config.CLUSTER,
    taskDefinition: config.TASK,
    count: 1,
    launchType: "FARGATE",
    networkConfiguration: {
      awsvpcConfiguration: {
        assignPublicIp: "ENABLED",
        subnets: ["subnet-xxx", "subnet-xxx", "subnet-xxx"],
        securityGroups: ["sg-xxx"],
      },
    },
    overrides: {
      containerOverrides: [
        {
          name: "builder-image",
          environment: [
            { name: "GIT_REPOSITORY_URL", value: gitURL },
            {
              name: "PROJECT_ID",
              value: projectSlug,
            },
            {
              name: "AWS_ACCESS_KEY",
              value: process.env.AWS_ACCESS_KEY,
            },
            {
              name: "AWS_SECRET_KEY",
              value: process.env.AWS_SECRET_KEY,
            },
          ],
        },
      ],
    },
  });

  await ecsClient.send(command);

  res.json({
    status: "QUEUED",
    data: {
      projectSlug,
      url: `http://${projectSlug}.localhost:8000`,
    },
  });
});

app.listen(PORT, () => console.log(`API server running on port ${PORT}`));
