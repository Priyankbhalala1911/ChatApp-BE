import { MigrationInterface, QueryRunner } from "typeorm";

export class AddISOnlineStatusUser1748409589856 implements MigrationInterface {
    name = 'AddISOnlineStatusUser1748409589856'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_message_sender"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_message_receiver"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_message_conversation"`);
        await queryRunner.query(`ALTER TABLE "conversation_users_user" DROP CONSTRAINT "FK_conversation_users_conversation"`);
        await queryRunner.query(`ALTER TABLE "conversation_users_user" DROP CONSTRAINT "FK_conversation_users_user"`);
        await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "isOnline" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "profileImage" DROP DEFAULT`);
        await queryRunner.query(`CREATE INDEX "IDX_7835ccf192c47ae47cd5c250d5" ON "conversation_users_user" ("conversationId") `);
        await queryRunner.query(`CREATE INDEX "IDX_b4d7dfd81d3b743bcfd1682abe" ON "conversation_users_user" ("userId") `);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_bc096b4e18b1f9508197cd98066" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_71fb36906595c602056d936fc13" FOREIGN KEY ("receiverId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_7cf4a4df1f2627f72bf6231635f" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "conversation_users_user" ADD CONSTRAINT "FK_7835ccf192c47ae47cd5c250d5a" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "conversation_users_user" ADD CONSTRAINT "FK_b4d7dfd81d3b743bcfd1682abeb" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conversation_users_user" DROP CONSTRAINT "FK_b4d7dfd81d3b743bcfd1682abeb"`);
        await queryRunner.query(`ALTER TABLE "conversation_users_user" DROP CONSTRAINT "FK_7835ccf192c47ae47cd5c250d5a"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_7cf4a4df1f2627f72bf6231635f"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_71fb36906595c602056d936fc13"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_bc096b4e18b1f9508197cd98066"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b4d7dfd81d3b743bcfd1682abe"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7835ccf192c47ae47cd5c250d5"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "profileImage" SET DEFAULT 'default-profile.png'`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isOnline"`);
        await queryRunner.query(`ALTER TABLE "message" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "conversation_users_user" ADD CONSTRAINT "FK_conversation_users_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "conversation_users_user" ADD CONSTRAINT "FK_conversation_users_conversation" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_message_conversation" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_message_receiver" FOREIGN KEY ("receiverId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_message_sender" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
