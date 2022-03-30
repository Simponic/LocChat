import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AddChatRoom1648605030863 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'chatroom',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
          },
          {
            name: 'name',
            type: 'text',
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
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('chatroom');
  }
}
