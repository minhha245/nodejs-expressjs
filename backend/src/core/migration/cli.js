#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');
const Migration = require('./Migration');

async function createMigrationFile(name) {
  const timestamp = Migration.generateTimestamp();
  const fileName = `${timestamp}_${name}.js`;
  const filePath = path.join(process.cwd(), 'src', 'migrations', fileName);

  const template = `
const Migration = require('../core/migration/Migration');

class ${name}Migration extends Migration {
  async up() {
    // Write your migration here
    // Example:
    // const table = this.createTable('table_name');
    // table.id();
    // table.string('name');
    // await table.execute();
  }

  async down() {
    // Write your rollback here
    // Example:
    // await this.dropTable('table_name').execute();
  }
}

module.exports = ${name}Migration;
`;

  await fs.writeFile(filePath, template.trim());
  console.log(`Created migration: ${fileName}`);
}

async function getMigrationFiles() {
  const migrationsDir = path.join(process.cwd(), 'src', 'migrations');
  const files = await fs.readdir(migrationsDir);
  return files
    .filter(file => file.endsWith('.js'))
    .sort()
    .map(file => ({
      name: file,
      path: path.join(migrationsDir, file)
    }));
}

async function migrate() {
  const migration = new Migration();
  await migration.connect();
  
  try {
    await migration.createMigrationsTable();
    const executedMigrations = await migration.getExecutedMigrations();
    const migrationFiles = await getMigrationFiles();
    
    const pendingMigrations = migrationFiles.filter(file => 
      !executedMigrations.find(m => m.name === file.name)
    );

    if (pendingMigrations.length === 0) {
      console.log('No pending migrations.');
      return;
    }

    const batch = executedMigrations.length > 0
      ? Math.max(...executedMigrations.map(m => m.batch)) + 1
      : 1;

    for (const migrationFile of pendingMigrations) {
      const MigrationClass = require(migrationFile.path);
      const instance = new MigrationClass();
      instance.connection = migration.connection;

      try {
        console.log(`Migrating: ${migrationFile.name}`);
        await instance.up();
        await migration.markAsMigrated(migrationFile.name, batch);
        console.log(`Migrated:  ${migrationFile.name}`);
      } catch (error) {
        console.error(`Error while migrating ${migrationFile.name}:`, error);
        throw error;
      }
    }
  } finally {
    await migration.disconnect();
  }
}

async function rollback() {
  const migration = new Migration();
  await migration.connect();
  
  try {
    const executedMigrations = await migration.getExecutedMigrations();
    if (executedMigrations.length === 0) {
      console.log('No migrations to rollback.');
      return;
    }

    const lastBatch = Math.max(...executedMigrations.map(m => m.batch));
    const migrationsToRollback = executedMigrations.filter(m => m.batch === lastBatch);

    for (const migrationRecord of migrationsToRollback.reverse()) {
      const migrationPath = path.join(process.cwd(), 'src', 'migrations', migrationRecord.name);
      const MigrationClass = require(migrationPath);
      const instance = new MigrationClass();
      instance.connection = migration.connection;

      try {
        console.log(`Rolling back: ${migrationRecord.name}`);
        await instance.down();
        await migration.removeMigration(migrationRecord.name);
        console.log(`Rolled back:  ${migrationRecord.name}`);
      } catch (error) {
        console.error(`Error while rolling back ${migrationRecord.name}:`, error);
        throw error;
      }
    }
  } finally {
    await migration.disconnect();
  }
}

async function main() {
  const command = process.argv[2];
  const name = process.argv[3];

  switch (command) {
    case 'create':
      if (!name) {
        console.error('Please provide a migration name');
        process.exit(1);
      }
      await createMigrationFile(name);
      break;

    case 'migrate':
      await migrate();
      break;

    case 'rollback':
      await rollback();
      break;

    default:
      console.log(`
Migration CLI

Commands:
  create <name>  Create a new migration file
  migrate        Run pending migrations
  rollback      Rollback the last batch of migrations
      `);
      break;
  }
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
}); 