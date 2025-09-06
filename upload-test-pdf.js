const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://zknmzaowomihtrtqleon.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inprbm16YW93b21paHRydHFsZW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTA2MTgsImV4cCI6MjA2NzI4NjYxOH0.CyAQrLWbXQDoRgBAxk6jgpFXYANUSm1UqwkB8Stz7DU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create a simple test PDF
function createTestPDF() {
  const testContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Times-Roman >> >> >> /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 200 >>
stream
BT
/F1 24 Tf
100 700 Td
(Test Script Document) Tj
0 -50 Td
/F1 16 Tf
(This is a test PDF for the Honey and Hemlock) Tj
0 -30 Td
(script review system.) Tj
0 -50 Td
/F1 12 Tf
(Page 1 of 1) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000274 00000 n
trailer
<< /Size 5 /Root 1 0 R >>
startxref
365
%%EOF`;
  
  const filePath = path.join(__dirname, 'test-script-actual.pdf');
  fs.writeFileSync(filePath, testContent);
  return filePath;
}

async function uploadAndUpdateScript() {
  try {
    console.log('Creating test PDF...');
    const testPdfPath = createTestPDF();
    const fileContent = fs.readFileSync(testPdfPath);
    
    // Upload to Supabase storage
    const fileName = `test-script-${Date.now()}.pdf`;
    const filePath = `scripts/${fileName}`;
    
    console.log('Uploading to Supabase storage...');
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('scripts')
      .upload(filePath, fileContent, {
        contentType: 'application/pdf',
        upsert: true
      });
    
    if (uploadError) {
      console.error('Upload error:', uploadError);
      return;
    }
    
    console.log('Upload successful:', uploadData);
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('scripts')
      .getPublicUrl(filePath);
    
    console.log('Public URL:', publicUrl);
    
    // Update the test script in the database
    const { data: updateData, error: updateError } = await supabase
      .from('scripts')
      .update({ 
        file_url: publicUrl,
        file_name: fileName
      })
      .eq('assigned_judge_id', '62c41eff-0f24-4bbc-8d09-29eb371499f0')
      .select();
    
    if (updateError) {
      console.error('Update error:', updateError);
      return;
    }
    
    console.log('Updated scripts:', updateData);
    console.log('\n✅ Success! Test PDF uploaded and scripts updated.');
    console.log('You can now view the PDF in the contractor dashboard.');
    
    // Clean up
    fs.unlinkSync(testPdfPath);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

uploadAndUpdateScript();