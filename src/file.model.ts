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

  @Column('varchar', {default: 'C:/'})
  path: string;

  @Column("varchar")
  name: string;

  @Column("bigint")
  size: number;

  @Column("integer")
  length: number;

  @Column("varchar")
  type: string;

  @OneToMany("FileData", "file")
  data: FileData[];
}
