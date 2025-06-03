import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user";
import { Message } from "./message";

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ default: false })
  isGroup!: boolean;

  @Column()
  lastMessage!: string;

  @Column({ type: "timestamp" })
  lastMessageTime!: string;

  @ManyToMany(() => User)
  @JoinTable()
  users!: User[];

  @OneToMany(() => Message, (m) => m.conversation)
  messages!: Message[];
}
