import { config } from "dotenv";
import { DataSourceOptions } from "typeorm";
import { FileData } from "./file-data.model";
import { File } from "./file.model";

config();

export const ormConfig: DataSourceOptions = {
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_DATABASE,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  entities: [FileData, File],
};
