import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user";
import { Conversation } from "./conversation";

@Entity()
export class Message {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  text!: string;

  @ManyToOne(() => User, (m) => m.sentMessages)
  sender!: User;

  @ManyToOne(() => User, (m) => m.receiveMessages)
  receiver!: User;

  @ManyToOne(() => Conversation, (c) => c.messages)
  conversation!: Conversation;

  @CreateDateColumn()
  createdAt!: Date;
}
