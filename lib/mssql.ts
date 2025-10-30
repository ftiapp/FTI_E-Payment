import sql from 'mssql'

// MSSQL connection configuration for FTI Member Database
const mssqlConfig = {
  server: process.env.MSSQL_SERVER || '',
  database: process.env.MSSQL_DATABASE || 'I',
  user: process.env.MSSQL_USER || 'itadmin',
  password: process.env.MSSQL_PASSWORD || '',
  options: {
    encrypt: true, // For Azure SQL
    enableArithAbort: true,
    trustServerCertificate: true // Allow self-signed certificates
  },
  connectionTimeout: 30000,
  requestTimeout: 30000,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
}

// Create MSSQL connection pool
let pool: sql.ConnectionPool | null = null

async function getMssqlPool(): Promise<sql.ConnectionPool> {
  if (!pool) {
    try {
      pool = await sql.connect(mssqlConfig)
      console.log('✅ MSSQL connected successfully to FTI Member Database')
    } catch (error) {
      console.error('❌ MSSQL connection failed:', error)
      throw error
    }
  }
  return pool
}

// Test MSSQL connection
export async function testMssqlConnection(): Promise<boolean> {
  try {
    const pool = await getMssqlPool()
    const result = await pool.request().query('SELECT 1 as test')
    console.log('✅ MSSQL test query successful:', result.recordset[0])
    return true
  } catch (error) {
    console.error('❌ MSSQL test query failed:', error)
    return false
  }
}

// Get FTI member by Member Code
export async function getFtiMemberByCode(memberCode: string) {
  try {
    const pool = await getMssqlPool()
    const result = await pool.request()
      .input('memberCode', sql.VarChar, memberCode)
      .query(`
        SELECT 
          [MEMBER_CODE],
          [TAX_ID],
          [COMPANY_NAME]
        FROM [FTI].[dbo].[BI_MEMBER]
        WHERE [MEMBER_CODE] = @memberCode
      `)
    
    return result.recordset[0] || null
  } catch (error) {
    console.error('Error fetching FTI member by code:', error)
    throw error
  }
}

// Get FTI member by Tax ID
export async function getFtiMemberByTaxId(taxId: string) {
  try {
    const pool = await getMssqlPool()
    const result = await pool.request()
      .input('taxId', sql.VarChar, taxId)
      .query(`
        SELECT 
          [MEMBER_CODE],
          [TAX_ID],
          [COMPANY_NAME]
        FROM [FTI].[dbo].[BI_MEMBER]
        WHERE [TAX_ID] = @taxId
      `)
    
    return result.recordset[0] || null
  } catch (error) {
    console.error('Error fetching FTI member by tax ID:', error)
    throw error
  }
}

// Search FTI members (by member code or tax ID)
export async function searchFtiMembers(query: string, searchBy: 'memberCode' | 'taxId' = 'memberCode') {
  try {
    if (searchBy === 'memberCode') {
      return await getFtiMemberByCode(query)
    } else {
      return await getFtiMemberByTaxId(query)
    }
  } catch (error) {
    console.error('Error searching FTI members:', error)
    throw error
  }
}

export default {
  getMssqlPool,
  testMssqlConnection,
  getFtiMemberByCode,
  getFtiMemberByTaxId,
  searchFtiMembers
}
