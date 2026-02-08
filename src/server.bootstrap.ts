import app from "./app.config.js";
import { env } from "./config/env.config.js";
import "reflect-metadata";
import { AppDataSource } from "./config/data-source.config.js";

async function start() {

  try {
    const server = app.getInstance();
    const port = env.port;
  
    await AppDataSource.initialize();
  
    server.listen(port, () => {
      console.log(`API running on port ${port}`);
    });
  } catch (error) {
    console.log(`Error while launching app:`, error)

    AppDataSource.destroy();
    process.exit(1);
  }
}

start();
