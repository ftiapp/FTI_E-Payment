import mysql from 'mysql2/promise'

// Create database connection pool with production optimizations
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'FTI_E-payment',
  waitForConnections: true,
  connectionLimit: 20, // Increased for production
  queueLimit: 0,
  timezone: '+07:00', // Thailand timezone
  acquireTimeout: 60000, // 60 seconds
  timeout: 60000, // 60 seconds
  reconnect: true, // Auto reconnect
  // SSL configuration for production
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
})

// Test connection
pool.getConnection()
  .then(conn => {
    console.log('✅ Database connected successfully')
    conn.release()
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message)
  })

export default pool
