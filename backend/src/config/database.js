module.exports = {
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'test_db',
    port: process.env.DB_PORT || 3306
  },
  
  // Timestamp configuration
  timestamps: {
    enabled: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
  
  // Soft delete configuration
  softDeletes: {
    enabled: true,
    columnName: 'del_flag',
    defaultValue: 0,
    deletedValue: 1
  }
}; 