# Setting Up Supabase Storage Bucket for Scripts

To enable script file uploads and viewing, you need to create a storage bucket in Supabase:

## Steps to Create the Bucket:

1. **Go to your Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard/project/zknmzaowomihtrtqleon

2. **Go to Storage Section**
   - Click on "Storage" in the left sidebar

3. **Create New Bucket**
   - Click on "New bucket" button
   - Enter the following details:
     - **Name:** `scripts`
     - **Public bucket:** Yes (check this box)
     - Click "Create bucket"

4. **Set Bucket Policies** (Optional - for better security)
   - After creating the bucket, click on it
   - Go to "Policies" tab
   - Add the following policies:
     
   **Upload Policy (for authenticated users):**
   ```sql
   -- Allow authenticated users to upload
   (bucket_id = 'scripts') AND (auth.role() = 'authenticated')
   ```
   
   **Download Policy (public access):**
   ```sql
   -- Allow anyone to download
   (bucket_id = 'scripts')
   ```

## Testing the Setup:

The contractor review system is now ready to use with test data:

1. **Login as Test Contractor:**
   - Go to: http://localhost:8080/contractor
   - Username: `test`
   - Password: `test`

2. **View Assigned Scripts:**
   - You'll see scripts assigned to the test contractor
   - Click "View & Review" to open the PDF viewer
   - The system will use a sample PDF for testing

3. **Review Features:**
   - View PDF pages
   - Add notes for each page
   - Submit overall review with recommendation

## Uploading Real Scripts:

Once the bucket is created, you can upload real PDF scripts:

1. Go to Storage > scripts bucket
2. Click "Upload files"
3. Select PDF files to upload
4. Update the script records in the database with the correct file_url

## Database Migration Status:

✅ All database migrations have been successfully applied:
- script_reviews table updated with status, overall_notes, updated_at columns
- script_page_notes table created for page-by-page notes
- scripts table updated with file_type and page_count columns
- Row Level Security policies configured
- Test data populated for testing

The system is now fully functional!