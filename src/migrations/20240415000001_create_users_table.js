const Migration = require('../core/migration/Migration');

class CreateUsersTableMigration extends Migration {
  async up() {
    const table = this.createTable('users');
    table.id();
    table.string('name');
    table.string('email').addColumn('email', 'VARCHAR(255)', { notNull: true });
    table.string('password');
    table.string('avatar', 500).addColumn('avatar', 'VARCHAR(500)');
    await table.execute();
  }

  async down() {
    await this.dropTable('users').execute();
  }
}

module.exports = CreateUsersTableMigration; 