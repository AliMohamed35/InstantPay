import { Sequelize } from "sequelize";
import logger from "../utilities/logger/winston.ts";

const sequelize = new Sequelize("fintech", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

export async function connectDB() {
  try {
    await sequelize.authenticate().then(()=>{
      logger.info("Database connected successfully");
    });
  } catch (error) {
    logger.error("Data base failed to connect!");
  }
}

export default sequelize;
