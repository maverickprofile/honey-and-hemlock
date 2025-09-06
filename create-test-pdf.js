const PDFDocument = require('pdfkit');
const fs = require('fs');

// Create a new PDF document
const doc = new PDFDocument();

// Pipe the PDF to a file
doc.pipe(fs.createWriteStream('test-script.pdf'));

// Add content to the PDF
doc.fontSize(24)
   .text('THE MIDNIGHT GARDEN', { align: 'center' });

doc.moveDown();
doc.fontSize(18)
   .text('A Screenplay by', { align: 'center' });

doc.moveDown(0.5);
doc.fontSize(20)
   .text('Test Author', { align: 'center' });

doc.moveDown(3);
doc.fontSize(12)
   .text('FADE IN:', { align: 'left' });

doc.moveDown();
doc.text('INT. MYSTERIOUS GARDEN - NIGHT');

doc.moveDown();
doc.text('A magical garden bathed in moonlight. Ancient trees whisper secrets as ethereal flowers glow softly in the darkness.');

doc.moveDown();
doc.text('SARAH (30s), a botanist with curious eyes, steps through an ornate iron gate. She carries a leather journal and a vintage camera.');

doc.moveDown();
doc.text('SARAH', { indent: 200 });
doc.text('(whispered)', { indent: 180 });
doc.text('This can\'t be real...', { indent: 150 });

doc.moveDown();
doc.text('She approaches a luminescent rose, its petals shimmering with an otherworldly light.');

doc.moveDown();
doc.text('Suddenly, a figure emerges from the shadows - THE GUARDIAN (ageless), dressed in flowing robes made of living vines.');

doc.moveDown();
doc.text('GUARDIAN', { indent: 200 });
doc.text('Welcome, Sarah. We\'ve been', { indent: 150 });
doc.text('expecting you.', { indent: 150 });

doc.moveDown();
doc.text('SARAH', { indent: 200 });
doc.text('(startled)', { indent: 180 });
doc.text('Who are you? What is this place?', { indent: 150 });

doc.moveDown();
doc.text('The Guardian smiles mysteriously.');

doc.moveDown();
doc.text('GUARDIAN', { indent: 200 });
doc.text('This garden exists between worlds.', { indent: 150 });
doc.text('And you, my dear, are its chosen', { indent: 150 });
doc.text('protector.', { indent: 150 });

// Add more pages to make it look like a real script
doc.addPage();
doc.fontSize(12);
doc.text('The story continues with Sarah discovering her connection to the magical garden...');
doc.moveDown();
doc.text('She learns about an ancient prophecy that speaks of a botanist who will save both the garden and the human world from an impending darkness.');

doc.addPage();
doc.text('Act II begins with Sarah training under the Guardian, learning to communicate with the sentient plants and understanding the delicate balance that keeps both worlds in harmony.');

doc.addPage();
doc.text('The climax arrives when Sarah must make a choice between her old life and her destiny as the garden\'s protector.');

doc.addPage();
doc.text('FADE OUT.');
doc.moveDown(2);
doc.text('THE END', { align: 'center' });

// Finalize the PDF
doc.end();

console.log('✅ Test PDF created: test-script.pdf');