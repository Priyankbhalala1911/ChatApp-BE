import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProfileImage1747980945433 implements MigrationInterface {
    name = 'AddProfileImage1747980945433'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "profileImage" character varying NOT NULL DEFAULT 'default-profile.png'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "profileImage"`);
    }

}
