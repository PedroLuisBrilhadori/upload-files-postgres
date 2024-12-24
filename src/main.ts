import { DataSource } from "typeorm";
import { ormConfig } from "./orm.config";

const main = async () => {
  const dataSource = new DataSource(ormConfig);
  await dataSource.initialize();
};

main();
