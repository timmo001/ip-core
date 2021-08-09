import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("logs")
export class LogEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "text", nullable: false })
  text!: string;

  @Column({ type: "varchar", nullable: false })
  level!: string;

  @Column({ type: "varchar", nullable: false })
  type!: string;

  @CreateDateColumn()
  createdOn?: Date;
}
