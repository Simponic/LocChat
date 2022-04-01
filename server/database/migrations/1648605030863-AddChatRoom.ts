import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';
import { uniqueId } from 'lodash';

export class AddChatRoom1648605030863 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // uuid from https://github.com/typeorm/typeorm/issues/3770
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.createTable(
      new Table({
        name: 'chat_room',
        columns: [
          {
            name: 'id',
            type: 'text',
            isPrimary: true,
            isUnique: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'latitude',
            type: 'float',
            isNullable: false,
          },
          {
            name: 'longitude',
            type: 'float',
            isNullable: false,
          },
          {
            name: 'radius',
            type: 'float',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'lastModified',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'chat_room',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('chat_room');
  }
}
