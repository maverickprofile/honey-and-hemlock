# How to Run Supabase Migrations for This Project

## ✅ ALWAYS USE THIS METHOD - Supabase Management API

### Why This Method?
- CLI often fails with hostname resolution errors
- Direct database connections are unreliable
- This method works consistently from anywhere
- Uses your Supabase access token for authentication
- No need for database passwords or connection strings

### Required Credentials (from .env file)
```
SUPABASE_ACCESS_TOKEN=sbp_8c6d3ea9a52b8c6cd63524b261dcca4978376e72
PROJECT_REF=zknmzaowomihtrtqleon
```

### Method 1: Using the Management API Script

1. Create a file `run-migration.js`:

```javascript
const https = require('https');

const projectRef = 'zknmzaowomihtrtqleon';
const accessToken = 'sbp_8c6d3ea9a52b8c6cd63524b261dcca4978376e72';

// Your SQL goes here
const sql = `
  -- Your migration SQL
`;

const data = JSON.stringify({
  query: sql
});

const options = {
  hostname: 'api.supabase.com',
  port: 443,
  path: `/v1/projects/${projectRef}/database/query`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('🚀 Applying migration via Supabase Management API...\n');

const req = https.request(options, (res) => {
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('✅ Migration applied successfully!');
    } else {
      console.log('Response:', responseData);
    }
  });
});

req.on('error', (e) => {
  console.error('Request failed:', e);
});

req.write(data);
req.end();
```

2. Run it:
```bash
node run-migration.js
```

### Method 2: Quick Function for Any SQL

Create this reusable function in `supabase-sql-runner.js`:

```javascript
const https = require('https');
const fs = require('fs');

function runSupabaseSQL(sqlFilePath) {
  const projectRef = 'zknmzaowomihtrtqleon';
  const accessToken = 'sbp_8c6d3ea9a52b8c6cd63524b261dcca4978376e72';
  
  const sql = fs.readFileSync(sqlFilePath, 'utf8');
  
  const data = JSON.stringify({ query: sql });
  
  const options = {
    hostname: 'api.supabase.com',
    port: 443,
    path: `/v1/projects/${projectRef}/database/query`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
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
          resolve(responseData);
        } else {
          console.log('❌ Failed:', responseData);
          reject(new Error(responseData));
        }
      });
    });
    
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Usage:
// runSupabaseSQL('./migrations/my-migration.sql');

module.exports = { runSupabaseSQL };
```

### What This Method Can Do:
✅ Create/modify functions
✅ Add/modify RLS policies  
✅ Create/alter tables
✅ Insert/update/delete data
✅ Grant permissions
✅ Run any valid PostgreSQL SQL

### What to Avoid:
❌ Don't use `supabase db push` - often fails with connection errors
❌ Don't use direct PostgreSQL connections - hostname resolution issues
❌ Don't rely on CLI migration commands - inconsistent results

### Testing SQL Before Running:
Always test your SQL first:
1. Go to Supabase Dashboard
2. Navigate to SQL Editor
3. Test your SQL there first
4. Once confirmed working, use the Management API method

### Success Indicators:
- Response status: 200 or 201
- No error messages in response
- Changes visible in Supabase Dashboard

### Troubleshooting:
If a migration fails:
1. Check the SQL syntax in Supabase SQL Editor first
2. Ensure the access token is valid
3. Verify the project reference is correct
4. Check if the SQL requires superuser privileges (some operations do)

## Remember: ALWAYS USE THE MANAGEMENT API METHOD!

This is the most reliable way to run migrations for this project.