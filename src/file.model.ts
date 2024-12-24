import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { FileData } from "./file-data.model";

@Entity("tb_files")
export class File {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("varchar")
  name: string;

  @OneToMany("FileData", "file")
  data: FileData[];
}
