import { DataSource } from "typeorm";
import { ormConfig } from "./orm.config";
import express, { Express } from "express";
import multer from "multer";

export type App = {
  app: Express;
  dataSource: DataSource;
  upload: multer.Multer;
};

export type AppOptions = {
  routesGenerator: (app: App) => any;
};

export const initializeApp = async ({ routesGenerator }: AppOptions) => {
  const dataSource = new DataSource(ormConfig);
  await dataSource.initialize();

  const app = express();
  const storage = multer.memoryStorage();
  const upload = multer({ storage: storage });

  routesGenerator({ app, dataSource, upload });

  app.listen(3000);
  return app;
};
