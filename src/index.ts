import express, {type Application} from "express";
import logger from "./utilities/logger/winston.ts";
import bootstrap from "./app.controller.ts";

const app: Application = express();
const PORT: number = 3000;

try {
    await bootstrap(app, express);

    app.listen(PORT, () => {
        logger.info(`Server started on port ${PORT}`);
    });
} catch (error: any) {
    logger.error(`Failed to start server: ${error?.stack ?? error.message ?? error}`);
    process.exit(1);
}