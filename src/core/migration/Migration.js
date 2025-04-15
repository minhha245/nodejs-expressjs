const mysql = require('mysql2/promise');
const dbConfig = require('../../config/database');
const moment = require('moment');

class Migration {
  constructor() {
    this.connection = null;
  }

  async connect() {
    this.connection = await mysql.createConnection(dbConfig.database);
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.end();
    }
  }

  async createMigrationsTable() {
    await this.connection.execute(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        batch INT NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async getExecutedMigrations() {
    const [rows] = await this.connection.execute('SELECT * FROM migrations ORDER BY batch ASC, id ASC');
    return rows;
  }

  async markAsMigrated(migrationName, batch) {
    await this.connection.execute(
      'INSERT INTO migrations (name, batch) VALUES (?, ?)',
      [migrationName, batch]
    );
  }

  async removeMigration(migrationName) {
    await this.connection.execute(
      'DELETE FROM migrations WHERE name = ?',
      [migrationName]
    );
  }

  createTable(tableName) {
    return new TableBuilder(this.connection, tableName);
  }

  dropTable(tableName) {
    return {
      async execute() {
        await this.connection.execute(`DROP TABLE IF EXISTS ${tableName}`);
      }
    };
  }

  // Helper method to generate timestamp for migration files
  static generateTimestamp() {
    return moment().format('YYYYMMDDHHmmss');
  }
}

class TableBuilder {
  constructor(connection, tableName) {
    this.connection = connection;
    this.tableName = tableName;
    this.columns = [];
    this.primaryKey = null;
    this.foreignKeys = [];
    this.timestamps = dbConfig.timestamps.enabled;
    this.softDeletes = dbConfig.softDeletes.enabled;
  }

  addColumn(name, type, options = {}) {
    this.columns.push({
      name,
      type,
      ...options
    });
    return this;
  }

  id() {
    this.addColumn('id', 'INT', { autoIncrement: true, notNull: true });
    this.primaryKey = 'id';
    return this;
  }

  string(name, length = 255) {
    return this.addColumn(name, `VARCHAR(${length})`);
  }

  integer(name) {
    return this.addColumn(name, 'INT');
  }

  boolean(name) {
    return this.addColumn(name, 'TINYINT(1)');
  }

  text(name) {
    return this.addColumn(name, 'TEXT');
  }

  datetime(name) {
    return this.addColumn(name, 'DATETIME');
  }

  timestamp(name) {
    return this.addColumn(name, 'TIMESTAMP');
  }

  foreignKey(column, referenceTable, referenceColumn = 'id') {
    this.foreignKeys.push({
      column,
      referenceTable,
      referenceColumn
    });
    return this;
  }

  async execute() {
    let sql = `CREATE TABLE ${this.tableName} (`;
    
    // Add standard columns
    sql += this.columns.map(column => {
      let columnSql = `${column.name} ${column.type}`;
      if (column.notNull) columnSql += ' NOT NULL';
      if (column.autoIncrement) columnSql += ' AUTO_INCREMENT';
      if (column.default !== undefined) columnSql += ` DEFAULT ${column.default}`;
      return columnSql;
    }).join(', ');

    // Add timestamp columns if enabled
    if (this.timestamps) {
      sql += `, ${dbConfig.timestamps.createdAt} TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;
      sql += `, ${dbConfig.timestamps.updatedAt} TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`;
    }

    // Add soft delete column if enabled
    if (this.softDeletes) {
      sql += `, ${dbConfig.softDeletes.columnName} TINYINT(1) NOT NULL DEFAULT ${dbConfig.softDeletes.defaultValue}`;
    }

    // Add primary key
    if (this.primaryKey) {
      sql += `, PRIMARY KEY (${this.primaryKey})`;
    }

    // Add foreign keys
    this.foreignKeys.forEach(fk => {
      sql += `, FOREIGN KEY (${fk.column}) REFERENCES ${fk.referenceTable}(${fk.referenceColumn})`;
    });

    sql += ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;';

    await this.connection.execute(sql);
  }
}

module.exports = Migration; 