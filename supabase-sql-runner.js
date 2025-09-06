/**
 * Supabase SQL Runner - Reliable method for running SQL migrations
 * This uses the Supabase Management API instead of unreliable CLI connections
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load .env file
const envPath = path.join(__dirname, 'honeyandhemlock', '.env');
const envConfig = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    if (line && !line.startsWith('#') && line.includes('=')) {
      const [key, ...valueParts] = line.split('=');
      envConfig[key.trim()] = valueParts.join('=').trim();
    }
  });
}

// Configuration from .env file
const CONFIG = {
  projectRef: envConfig.SUPABASE_PROJECT_REF || 'zknmzaowomihtrtqleon',
  accessToken: envConfig.SUPABASE_ACCESS_TOKEN || 'sbp_8c6d3ea9a52b8c6cd63524b261dcca4978376e72'
};

/**
 * Run SQL directly on Supabase using Management API
 * @param {string} sql - The SQL to execute
 * @returns {Promise} - Resolves with response data or rejects with error
 */
function executeSQL(sql) {
  const data = JSON.stringify({ query: sql });
  
  const options = {
    hostname: 'api.supabase.com',
    port: 443,
    path: `/v1/projects/${CONFIG.projectRef}/database/query`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CONFIG.accessToken}`,
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };
  
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log('✅ SQL executed successfully!');
          resolve(JSON.parse(responseData || '{}'));
        } else {
          console.log('❌ SQL execution failed');
          console.log('Status:', res.statusCode);
          console.log('Response:', responseData);
          reject(new Error(`Failed with status ${res.statusCode}: ${responseData}`));
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
      reject(error);
    });
    
    req.write(data);
    req.end();
  });
}

/**
 * Run SQL from a file
 * @param {string} filePath - Path to SQL file
 * @returns {Promise} - Resolves when SQL is executed
 */
async function runSQLFile(filePath) {
  console.log(`📄 Reading SQL from: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  
  const sql = fs.readFileSync(filePath, 'utf8');
  console.log(`📝 SQL length: ${sql.length} characters`);
  console.log('🚀 Executing SQL via Supabase Management API...\n');
  
  return executeSQL(sql);
}

/**
 * Run multiple SQL files in sequence
 * @param {string[]} filePaths - Array of SQL file paths
 * @returns {Promise} - Resolves when all SQL files are executed
 */
async function runMultipleSQLFiles(filePaths) {
  console.log(`🔄 Running ${filePaths.length} SQL files...\n`);
  
  for (const filePath of filePaths) {
    try {
      await runSQLFile(filePath);
      console.log(`✅ Completed: ${filePath}\n`);
    } catch (error) {
      console.error(`❌ Failed: ${filePath}`);
      console.error(error.message);
      throw error; // Stop on first error
    }
  }
  
  console.log('🎉 All SQL files executed successfully!');
}

/**
 * Run inline SQL directly
 * @param {string} sql - SQL to execute
 * @param {string} description - Optional description for logging
 * @returns {Promise} - Resolves when SQL is executed
 */
async function runInlineSQL(sql, description = 'SQL command') {
  console.log(`📝 Executing: ${description}`);
  console.log('🚀 Running SQL via Supabase Management API...\n');
  
  return executeSQL(sql);
}

// Export functions for use in other scripts
module.exports = {
  executeSQL,
  runSQLFile,
  runMultipleSQLFiles,
  runInlineSQL,
  CONFIG
};

// If run directly from command line
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage:');
    console.log('  node supabase-sql-runner.js <sql-file.sql>');
    console.log('  node supabase-sql-runner.js file1.sql file2.sql file3.sql');
    console.log('\nExample:');
    console.log('  node supabase-sql-runner.js ./migrations/create-tables.sql');
    process.exit(1);
  }
  
  // Run the SQL files
  if (args.length === 1) {
    runSQLFile(args[0])
      .then(() => {
        console.log('✅ Done!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ Error:', error.message);
        process.exit(1);
      });
  } else {
    runMultipleSQLFiles(args)
      .then(() => {
        console.log('✅ All done!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ Error:', error.message);
        process.exit(1);
      });
  }
}