import { Sequelize } from "sequelize";
import logger from "../utilities/logger/winston.ts";

const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASSWORD ?? "",
  { host: process.env.DB_HOST, dialect: process.env.DB_DIALECT as any },
);

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
