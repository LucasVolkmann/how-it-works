import express from "express";
import cors from "cors";

import { logger } from "./config/logger.js";
import { globalErrorMiddleware } from "./middlewares/errors/global.js";
import router from "./routes/router.js";

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
        this.express.use(router);
    }

    private _configureErrorHandling() {
        this.express.use(globalErrorMiddleware);
    }

    getInstance() {
        return this.express;
    }
}

export default new App();
