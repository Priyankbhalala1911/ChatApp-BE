import { MigrationInterface, QueryRunner } from "typeorm";

export class AddConversationFields1748409589857 implements MigrationInterface {
  name = "AddConversationFields1748409589857";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "conversation" 
            ADD COLUMN IF NOT EXISTS "lastMessage" character varying,
            ADD COLUMN IF NOT EXISTS "lastMessageTime" TIMESTAMP
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "conversation" 
            DROP COLUMN IF EXISTS "lastMessage",
            DROP COLUMN IF EXISTS "lastMessageTime"
        `);
  }
}
