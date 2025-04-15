const { Sequelize } = require('sequelize');
const config = require('./database');

const sequelize = new Sequelize(
    config.database.database,
    config.database.user,
    config.database.password,
    {
        host: config.database.host,
        port: config.database.port,
        dialect: 'mysql',
        logging: false,
        define: {
            timestamps: config.timestamps.enabled,
            createdAt: config.timestamps.createdAt,
            updatedAt: config.timestamps.updatedAt,
            paranoid: config.softDeletes.enabled,
            deletedAt: config.softDeletes.columnName
        }
    }
);

module.exports = sequelize;
