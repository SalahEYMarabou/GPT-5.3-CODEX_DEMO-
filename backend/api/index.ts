import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import express from "express";
import { AppModule } from "../src/app.module";
import { configureApp } from "../src/app.setup";

let cachedServer: ReturnType<typeof express> | null = null;

async function getServer() {
  if (cachedServer) {
    return cachedServer;
  }

  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  configureApp(app);
  await app.init();

  cachedServer = server;
  return server;
}

export default async function handler(req: any, res: any) {
  const server = await getServer();
  return server(req, res);
}
