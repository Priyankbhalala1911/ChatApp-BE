import { Length, Matches, IsNotEmpty } from "class-validator";
import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Message } from "./message";
import { Conversation } from "./conversation";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  @IsNotEmpty({ message: "Name is required!" })
  name!: string;

  @Column({ unique: true })
  @IsNotEmpty({ message: "Email is required!" })
  email!: string;

  @Column()
  @Matches(
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).+$/,
    {
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, one numeric digit, and one special character",
    }
  )
  @Length(8, 18, {
    message: "Password must be between 8 and 18 characters long",
  })
  @IsNotEmpty({ message: "Password is required!" })
  password!: string;

  @Column()
  profileImage!: string;

  @OneToMany(() => Message, (m) => m.sender)
  sentMessages!: Message[];

  @OneToMany(() => Message, (m) => m.receiver)
  receiveMessages!: Message[];

  @ManyToMany(() => Conversation, (c) => c.users)
  conversations!: Conversation[];
}
