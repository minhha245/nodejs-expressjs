const mysql = require('mysql2/promise');
const dbConfig = require('../../config/database');

class QueryBuilder {
  constructor(tableName) {
    this.tableName = tableName;
    this.whereConditions = [];
    this.selectColumns = ['*'];
    this.limitValue = null;
    this.offsetValue = null;
    this.orderByColumns = [];
    this.joinClauses = [];
  }

  static async getConnection() {
    if (!this.pool) {
      this.pool = mysql.createPool(dbConfig.database);
    }
    return await this.pool.getConnection();
  }

  select(columns) {
    if (Array.isArray(columns)) {
      this.selectColumns = columns;
    } else if (typeof columns === 'string') {
      this.selectColumns = [columns];
    }
    return this;
  }

  where(column, operator, value) {
    this.whereConditions.push({
      column,
      operator,
      value,
      type: 'AND'
    });
    return this;
  }

  orWhere(column, operator, value) {
    this.whereConditions.push({
      column,
      operator,
      value,
      type: 'OR'
    });
    return this;
  }

  limit(value) {
    this.limitValue = value;
    return this;
  }

  offset(value) {
    this.offsetValue = value;
    return this;
  }

  orderBy(column, direction = 'ASC') {
    this.orderByColumns.push({ column, direction });
    return this;
  }

  join(table, firstColumn, operator, secondColumn) {
    this.joinClauses.push({
      type: 'INNER',
      table,
      firstColumn,
      operator,
      secondColumn
    });
    return this;
  }

  leftJoin(table, firstColumn, operator, secondColumn) {
    this.joinClauses.push({
      type: 'LEFT',
      table,
      firstColumn,
      operator,
      secondColumn
    });
    return this;
  }

  buildQuery() {
    let query = `SELECT ${this.selectColumns.join(', ')} FROM ${this.tableName}`;

    // Add joins
    if (this.joinClauses.length > 0) {
      query += ' ' + this.joinClauses.map(join => 
        `${join.type} JOIN ${join.table} ON ${join.firstColumn} ${join.operator} ${join.secondColumn}`
      ).join(' ');
    }

    // Add where conditions
    if (this.whereConditions.length > 0 || dbConfig.softDeletes.enabled) {
      query += ' WHERE';
      
      // Add soft delete condition by default
      if (dbConfig.softDeletes.enabled) {
        query += ` ${this.tableName}.${dbConfig.softDeletes.columnName} = ${dbConfig.softDeletes.defaultValue}`;
        if (this.whereConditions.length > 0) {
          query += ' AND';
        }
      }

      query += this.whereConditions.map((condition, index) => {
        const connector = index === 0 ? '' : ` ${condition.type}`;
        return `${connector} ${condition.column} ${condition.operator} ?`;
      }).join('');
    }

    // Add order by
    if (this.orderByColumns.length > 0) {
      query += ' ORDER BY ' + this.orderByColumns.map(order => 
        `${order.column} ${order.direction}`
      ).join(', ');
    }

    // Add limit and offset
    if (this.limitValue !== null) {
      query += ` LIMIT ${this.limitValue}`;
      if (this.offsetValue !== null) {
        query += ` OFFSET ${this.offsetValue}`;
      }
    }

    return query;
  }

  async get() {
    const connection = await QueryBuilder.getConnection();
    try {
      const query = this.buildQuery();
      const values = this.whereConditions.map(condition => condition.value);
      const [rows] = await connection.execute(query, values);
      return rows;
    } finally {
      connection.release();
    }
  }

  async first() {
    this.limit(1);
    const results = await this.get();
    return results[0] || null;
  }

  async insert(data) {
    const connection = await QueryBuilder.getConnection();
    try {
      if (dbConfig.timestamps.enabled) {
        data[dbConfig.timestamps.createdAt] = new Date();
        data[dbConfig.timestamps.updatedAt] = new Date();
      }
      if (dbConfig.softDeletes.enabled) {
        data[dbConfig.softDeletes.columnName] = dbConfig.softDeletes.defaultValue;
      }

      const columns = Object.keys(data);
      const values = Object.values(data);
      const query = `INSERT INTO ${this.tableName} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`;
      
      const [result] = await connection.execute(query, values);
      return result;
    } finally {
      connection.release();
    }
  }

  async update(data) {
    const connection = await QueryBuilder.getConnection();
    try {
      if (dbConfig.timestamps.enabled) {
        data[dbConfig.timestamps.updatedAt] = new Date();
      }

      const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
      let query = `UPDATE ${this.tableName} SET ${setClause}`;
      
      if (this.whereConditions.length > 0 || dbConfig.softDeletes.enabled) {
        query += ' WHERE';
        
        if (dbConfig.softDeletes.enabled) {
          query += ` ${dbConfig.softDeletes.columnName} = ${dbConfig.softDeletes.defaultValue}`;
          if (this.whereConditions.length > 0) {
            query += ' AND';
          }
        }

        query += this.whereConditions.map((condition, index) => {
          const connector = index === 0 ? '' : ` ${condition.type}`;
          return `${connector} ${condition.column} ${condition.operator} ?`;
        }).join('');
      }

      const values = [...Object.values(data), ...this.whereConditions.map(condition => condition.value)];
      const [result] = await connection.execute(query, values);
      return result;
    } finally {
      connection.release();
    }
  }

  async delete() {
    const connection = await QueryBuilder.getConnection();
    try {
      if (dbConfig.softDeletes.enabled) {
        // Perform soft delete
        return await this.update({
          [dbConfig.softDeletes.columnName]: dbConfig.softDeletes.deletedValue
        });
      } else {
        // Perform hard delete
        let query = `DELETE FROM ${this.tableName}`;
        if (this.whereConditions.length > 0) {
          query += ' WHERE ' + this.whereConditions.map((condition, index) => {
            const connector = index === 0 ? '' : ` ${condition.type}`;
            return `${connector} ${condition.column} ${condition.operator} ?`;
          }).join('');
        }
        
        const values = this.whereConditions.map(condition => condition.value);
        const [result] = await connection.execute(query, values);
        return result;
      }
    } finally {
      connection.release();
    }
  }
}

module.exports = QueryBuilder; 