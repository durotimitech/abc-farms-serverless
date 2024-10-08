import { DynamoDB } from "aws-sdk";

export const docClient = new DynamoDB.DocumentClient({
  region: "us-east-1",
  maxRetries: 3,
  httpOptions: {
    timeout: 5000,
  },
});

