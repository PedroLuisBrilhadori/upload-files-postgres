import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

@Entity("tb_data_files")
export class FileData {
  @PrimaryColumn("integer")
  id: number;

  @PrimaryColumn("uuid", { name: "file_id" })
  fileId: string;

  @Column('varchar', {default: 'C:/'})
  path: string;

  @Column("bytea")
  data: Buffer;

  @ManyToOne("File", "data")
  @JoinColumn({ name: "file_id" })
  file: File;
}
