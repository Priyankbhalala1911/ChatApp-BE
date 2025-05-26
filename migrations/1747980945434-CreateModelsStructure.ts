import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateModelsStructure1747980945434 implements MigrationInterface {
    name = 'CreateModelsStructure1747980945434'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add profileImage to User table
        await queryRunner.query(`
            ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "profileImage" character varying NOT NULL DEFAULT 'default-profile.png'
        `);

        // Create Conversation table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "conversation" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "isGroup" boolean NOT NULL DEFAULT false,
                CONSTRAINT "PK_conversation_id" PRIMARY KEY ("id")
            )
        `);

        // Create Message table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "message" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "text" character varying NOT NULL,
                "crearedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "senderId" uuid,
                "receiverId" uuid,
                "conversationId" uuid,
                CONSTRAINT "PK_message_id" PRIMARY KEY ("id")
            )
        `);

        // Create join table for User-Conversation many-to-many relationship
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "conversation_users_user" (
                "conversationId" uuid NOT NULL,
                "userId" uuid NOT NULL,
                CONSTRAINT "PK_conversation_users" PRIMARY KEY ("conversationId", "userId")
            )
        `);

        // Add foreign key constraints
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'FK_message_sender'
                ) THEN
                    ALTER TABLE "message" 
                    ADD CONSTRAINT "FK_message_sender" 
                    FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
                END IF;
            END $$;
        `);

        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'FK_message_receiver'
                ) THEN
                    ALTER TABLE "message" 
                    ADD CONSTRAINT "FK_message_receiver" 
                    FOREIGN KEY ("receiverId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
                END IF;
            END $$;
        `);

        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'FK_message_conversation'
                ) THEN
                    ALTER TABLE "message" 
                    ADD CONSTRAINT "FK_message_conversation" 
                    FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
                END IF;
            END $$;
        `);

        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'FK_conversation_users_conversation'
                ) THEN
                    ALTER TABLE "conversation_users_user" 
                    ADD CONSTRAINT "FK_conversation_users_conversation" 
                    FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
                END IF;
            END $$;
        `);

        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'FK_conversation_users_user'
                ) THEN
                    ALTER TABLE "conversation_users_user" 
                    ADD CONSTRAINT "FK_conversation_users_user" 
                    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints first
        await queryRunner.query(`ALTER TABLE "conversation_users_user" DROP CONSTRAINT IF EXISTS "FK_conversation_users_user"`);
        await queryRunner.query(`ALTER TABLE "conversation_users_user" DROP CONSTRAINT IF EXISTS "FK_conversation_users_conversation"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT IF EXISTS "FK_message_conversation"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT IF EXISTS "FK_message_receiver"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT IF EXISTS "FK_message_sender"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE IF EXISTS "conversation_users_user"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "message"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "conversation"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "profileImage"`);
    }
} 