import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("events")
export class EventEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", nullable: false })
  service!: string;

  @Column({ type: "varchar", nullable: true })
  endpoint!: string;

  @Column({ type: "varchar", nullable: false })
  status!: string;

  @Column({ type: "text", nullable: true })
  message?: string;

  @CreateDateColumn()
  createdOn?: Date;

  @CreateDateColumn()
  updatedOn?: Date;

  @CreateDateColumn()
  completedOn?: Date;
}
