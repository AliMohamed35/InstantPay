import { Sequelize } from "sequelize";
import logger from "../utilities/logger/winston.ts";

const sequelize = new Sequelize("fintech", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

export async function connectDB() {
  try {
    await sequelize.authenticate();
    logger.info("Database connected successfully");
  } catch (error: any) {
    logger.error(`Database failed to connect: ${error.stack ?? error.message ?? error}`);
    throw error;
  }
}

export default sequelize;
