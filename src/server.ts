import http from "http";
import app from "./app.js";
import { env } from "./config/env.js";
import "reflect-metadata";
import { AppDataSource } from "./config/data-source.js";

export class Server {

    private app;
    private port: number;
    private httpServer: http.Server;

  constructor() {
    this.port = env.port;
    this.app = app.getInstance();
    this.httpServer = http.createServer(this.app);
  }

  async start() {
    await AppDataSource.initialize();

    this.httpServer.listen(this.port, () => {
      console.log(`API running on port ${this.port}`);
    });

    this.httpServer.on("error", (error) => {
      console.error("Server error:", error);
      process.exit(1);
    });
  }
}

new Server().start();
