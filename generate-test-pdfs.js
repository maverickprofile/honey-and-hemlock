const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://zknmzaowomihtrtqleon.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inprbm16YW93b21paHRydHFsZW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTA2MTgsImV4cCI6MjA2NzI4NjYxOH0.CyAQrLWbXQDoRgBAxk6jgpFXYANUSm1UqwkB8Stz7DU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create a proper multi-page PDF with the given title and tier
function createTestPDF(title, tier) {
  const pageCount = 5;
  let pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [`;
  
  // Add page references
  for (let i = 0; i < pageCount; i++) {
    pdfContent += ` ${3 + i * 2} 0 R`;
  }
  
  pdfContent += `] /Count ${pageCount} >>
endobj
`;

  // Create pages with content
  let currentObj = 3;
  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    // Page object
    pdfContent += `${currentObj} 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /MediaBox [0 0 612 792] /Contents ${currentObj + 1} 0 R >>
endobj
`;
    currentObj++;
    
    // Content stream for this page
    const content = `BT
/F1 24 Tf
72 720 Td
(${title}) Tj
0 -30 Td
/F1 18 Tf
(Tier: $${tier}) Tj
0 -40 Td
/F2 14 Tf
(Page ${pageNum} of ${pageCount}) Tj
0 -40 Td
/F1 16 Tf
(Chapter ${pageNum}: Story Development) Tj
0 -30 Td
/F2 12 Tf
(FADE IN:) Tj
0 -30 Td
0 -20 Td
(INT. COFFEE SHOP - DAY) Tj
0 -30 Td
(The bustling coffee shop is filled with the aroma of freshly) Tj
0 -15 Td
(brewed coffee. SARAH, 28, sits at a corner table, her laptop) Tj
0 -15 Td
(open, fingers dancing across the keyboard.) Tj
0 -30 Td
(                    SARAH) Tj
0 -15 Td
(          (muttering to herself)) Tj
0 -15 Td
(     Just one more chapter...) Tj
0 -30 Td
(She pauses, takes a sip of her coffee, and glances out the) Tj
0 -15 Td
(window. The rain has started to fall, creating rivulets on) Tj
0 -15 Td
(the glass. She smiles softly and returns to her writing.) Tj
0 -30 Td
(JOHN, 30, enters the coffee shop, shaking off his umbrella.) Tj
0 -15 Td
(He scans the room and his eyes land on Sarah. Recognition) Tj
0 -15 Td
(flickers across his face.) Tj
0 -30 Td
(                    JOHN) Tj
0 -15 Td
(          Sarah? Is that you?) Tj
0 -30 Td
(Sarah looks up, surprised. A mix of emotions crosses her face.) Tj
0 -30 Td
(                    SARAH) Tj
0 -15 Td
(     John... I didn't expect to see you here.) Tj
0 -30 Td
(They stare at each other for a moment, the coffee shop noise) Tj
0 -15 Td
(fading into the background.) Tj
ET`;

    const contentLength = content.length;
    pdfContent += `${currentObj} 0 obj
<< /Length ${contentLength} >>
stream
${content}
endstream
endobj
`;
    currentObj++;
  }

  // Add xref table
  pdfContent += `xref
0 ${currentObj}
0000000000 65535 f
`;
  
  let position = 9;
  for (let i = 1; i < currentObj; i++) {
    pdfContent += `${String(position).padStart(10, '0')} 00000 n
`;
    position += 100; // Approximate position increment
  }
  
  pdfContent += `trailer
<< /Size ${currentObj} /Root 1 0 R >>
startxref
${position}
%%EOF`;

  return pdfContent;
}

async function uploadTestScripts() {
  try {
    console.log('Creating test PDFs...');
    
    const tiers = [
      { amount: 500, name: 'Test 500', tierName: 'Basic Review' },
      { amount: 750, name: 'Test 750', tierName: 'Standard Review' },
      { amount: 1000, name: 'Test 1000', tierName: 'Premium Review' }
    ];
    
    for (const tier of tiers) {
      console.log(`\nCreating ${tier.name}.pdf...`);
      
      // Create PDF content
      const pdfContent = createTestPDF(tier.name, tier.amount);
      const fileName = `${tier.name}.pdf`;
      const localPath = path.join(__dirname, fileName);
      
      // Save locally first
      fs.writeFileSync(localPath, pdfContent);
      console.log(`Saved ${fileName} locally`);
      
      // Upload to Supabase storage
      const fileBuffer = fs.readFileSync(localPath);
      const storagePath = `scripts/${fileName}`;
      
      console.log(`Uploading ${fileName} to Supabase...`);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('scripts')
        .upload(storagePath, fileBuffer, {
          contentType: 'application/pdf',
          upsert: true
        });
      
      if (uploadError) {
        console.error(`Upload error for ${fileName}:`, uploadError);
        continue;
      }
      
      console.log(`Upload successful for ${fileName}`);
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('scripts')
        .getPublicUrl(storagePath);
      
      console.log(`Public URL: ${publicUrl}`);
      
      // Create script record in database
      const { data: scriptData, error: scriptError } = await supabase
        .from('scripts')
        .insert({
          title: `${tier.name} - Screenplay`,
          author_name: `Test Author ${tier.amount}`,
          author_email: `test${tier.amount}@example.com`,
          author_phone: `555-${tier.amount}-0000`,
          file_url: publicUrl,
          file_name: fileName,
          status: 'pending',
          amount: tier.amount,
          tier_name: tier.tierName,
          tier_id: `tier_${tier.amount}`,
          payment_status: 'paid',
          assigned_judge_id: '62c41eff-0f24-4bbc-8d09-29eb371499f0', // Test Contractor
          page_count: 5,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (scriptError) {
        console.error(`Database error for ${fileName}:`, scriptError);
        continue;
      }
      
      console.log(`✅ Successfully created and uploaded ${tier.name}`);
      console.log(`   Script ID: ${scriptData.id}`);
      console.log(`   Amount: $${tier.amount}`);
      console.log(`   Tier: ${tier.tierName}`);
      
      // Clean up local file
      fs.unlinkSync(localPath);
    }
    
    console.log('\n✅ All test scripts created and uploaded successfully!');
    console.log('You can now test the rubric system with different tiers.');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

uploadTestScripts();