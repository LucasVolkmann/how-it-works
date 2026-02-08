import express from "express";
import cors from "cors";

import { logger } from "./config/logger.config.js";
import { globalErrorMiddleware } from "./shared/middlewares/global-error.middleware.js";
import router from "./routes/index.js";
import { routeNotFound } from "./shared/middlewares/not-found.middleware.js";

class App {

    private express;

    constructor() {
        this.express = express();
        this._configureMiddlewares();
        this._configureRoutes();
        this._configureErrorHandling();
    }

    private _configureMiddlewares() {
        this.express.use(cors());
        this.express.use(express.json());
        this.express.use(logger);
    }

    private _configureRoutes() {
        this.express.use("/api", router);
        this.express.use(routeNotFound);
    }

    private _configureErrorHandling() {
        this.express.use(globalErrorMiddleware);
    }

    getInstance() {
        return this.express;
    }
}

export default new App();
