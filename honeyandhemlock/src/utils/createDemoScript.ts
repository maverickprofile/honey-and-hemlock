import jsPDF from 'jspdf';

export const createDemoScript = () => {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const lineHeight = 7;
  let yPosition = margin;

  // Title Page
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('THE GOLDEN HORIZON', pageWidth / 2, 100, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('A Short Film', pageWidth / 2, 115, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text('Written by', pageWidth / 2, 140, { align: 'center' });
  doc.setFontSize(14);
  doc.text('Demo Writer', pageWidth / 2, 150, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text('DEMO SCRIPT - For Testing Purposes Only', pageWidth / 2, 200, { align: 'center' });
  doc.text('© 2025 Honey & Hemlock Productions', pageWidth / 2, 210, { align: 'center' });
  
  // Page 2 - Scene 1
  doc.addPage();
  yPosition = margin;
  
  doc.setFontSize(12);
  doc.setFont('courier', 'bold');
  doc.text('FADE IN:', margin, yPosition);
  yPosition += lineHeight * 2;
  
  doc.text('EXT. COASTAL CLIFF - DAWN', margin, yPosition);
  yPosition += lineHeight * 2;
  
  doc.setFont('courier', 'normal');
  const scene1Desc = [
    'The sun slowly rises over a misty ocean horizon. Waves',
    'crash against jagged rocks below. A lone figure, SARAH',
    '(30s), stands at the cliff edge, her hair whipping in',
    'the salt-tinged wind.'
  ];
  
  scene1Desc.forEach(line => {
    doc.text(line, margin, yPosition);
    yPosition += lineHeight;
  });
  
  yPosition += lineHeight;
  
  // Character introduction
  doc.setFont('courier', 'bold');
  doc.text('SARAH', pageWidth / 2 - 20, yPosition);
  yPosition += lineHeight;
  
  doc.setFont('courier', 'normal');
  doc.text('(whispered)', pageWidth / 2 - 25, yPosition);
  yPosition += lineHeight;
  
  const dialogue1 = [
    'This is it. After all these',
    'years... I finally found it.'
  ];
  
  dialogue1.forEach(line => {
    doc.text(line, pageWidth / 2 - 40, yPosition);
    yPosition += lineHeight;
  });
  
  yPosition += lineHeight * 2;
  
  const action1 = [
    'She pulls out an old, weathered MAP from her backpack.',
    'Her fingers trace along faded lines until they stop at',
    'a marked location - exactly where she stands now.'
  ];
  
  action1.forEach(line => {
    doc.text(line, margin, yPosition);
    yPosition += lineHeight;
  });
  
  yPosition += lineHeight * 2;
  
  // Scene 2
  doc.setFont('courier', 'bold');
  doc.text('INT. SARAH\'S APARTMENT - FLASHBACK - NIGHT', margin, yPosition);
  yPosition += lineHeight * 2;
  
  doc.setFont('courier', 'normal');
  const scene2Desc = [
    'A cramped studio apartment cluttered with MARITIME MAPS,',
    'OLD BOOKS, and NEWSPAPER CLIPPINGS. Sarah, younger and',
    'more energetic, pores over documents at her desk.'
  ];
  
  scene2Desc.forEach(line => {
    doc.text(line, margin, yPosition);
    yPosition += lineHeight;
  });
  
  yPosition += lineHeight * 2;
  
  const action2 = [
    'Her phone RINGS. She glances at the caller ID:',
    '"UNKNOWN NUMBER". After a moment\'s hesitation, she',
    'answers.'
  ];
  
  action2.forEach(line => {
    doc.text(line, margin, yPosition);
    yPosition += lineHeight;
  });
  
  yPosition += lineHeight;
  
  doc.setFont('courier', 'bold');
  doc.text('SARAH', pageWidth / 2 - 20, yPosition);
  yPosition += lineHeight;
  
  doc.setFont('courier', 'normal');
  doc.text('Hello?', pageWidth / 2 - 40, yPosition);
  yPosition += lineHeight * 2;
  
  doc.setFont('courier', 'bold');
  doc.text('MYSTERIOUS VOICE (V.O.)', pageWidth / 2 - 20, yPosition);
  yPosition += lineHeight;
  
  doc.setFont('courier', 'normal');
  doc.text('(filtered)', pageWidth / 2 - 25, yPosition);
  yPosition += lineHeight;
  
  const dialogue2 = [
    'The lighthouse keeper left',
    'something for you. Check the',
    'third stone from the north wall.'
  ];
  
  dialogue2.forEach(line => {
    doc.text(line, pageWidth / 2 - 40, yPosition);
    yPosition += lineHeight;
  });
  
  // Page 3
  doc.addPage();
  yPosition = margin;
  
  doc.setFont('courier', 'normal');
  const action3 = [
    'The line goes DEAD. Sarah stares at the phone,',
    'bewildered.'
  ];
  
  action3.forEach(line => {
    doc.text(line, margin, yPosition);
    yPosition += lineHeight;
  });
  
  yPosition += lineHeight * 2;
  
  doc.setFont('courier', 'bold');
  doc.text('SARAH', pageWidth / 2 - 20, yPosition);
  yPosition += lineHeight;
  
  doc.setFont('courier', 'normal');
  const dialogue3 = [
    'Wait, who is this? Hello?',
    'HELLO?'
  ];
  
  dialogue3.forEach(line => {
    doc.text(line, pageWidth / 2 - 40, yPosition);
    yPosition += lineHeight;
  });
  
  yPosition += lineHeight * 2;
  
  doc.setFont('courier', 'bold');
  doc.text('END FLASHBACK', margin, yPosition);
  yPosition += lineHeight * 2;
  
  doc.text('EXT. COASTAL CLIFF - DAWN (PRESENT)', margin, yPosition);
  yPosition += lineHeight * 2;
  
  doc.setFont('courier', 'normal');
  const scene3Desc = [
    'Sarah kneels beside an old STONE WALL, partially',
    'collapsed from years of erosion. She counts the stones',
    'carefully, her breath visible in the cool morning air.'
  ];
  
  scene3Desc.forEach(line => {
    doc.text(line, margin, yPosition);
    yPosition += lineHeight;
  });
  
  yPosition += lineHeight * 2;
  
  doc.setFont('courier', 'bold');
  doc.text('SARAH', pageWidth / 2 - 20, yPosition);
  yPosition += lineHeight;
  
  doc.setFont('courier', 'normal');
  doc.text('One... two... three.', pageWidth / 2 - 40, yPosition);
  yPosition += lineHeight * 2;
  
  const action4 = [
    'She pulls at the third stone. It resists at first,',
    'then slowly gives way, revealing a small METAL BOX',
    'hidden within.'
  ];
  
  action4.forEach(line => {
    doc.text(line, margin, yPosition);
    yPosition += lineHeight;
  });
  
  yPosition += lineHeight * 2;
  
  const action5 = [
    'With trembling hands, she opens the box. Inside: a',
    'BRASS COMPASS and a folded NOTE. She unfolds the note',
    'and reads.'
  ];
  
  action5.forEach(line => {
    doc.text(line, margin, yPosition);
    yPosition += lineHeight;
  });
  
  // Page 4
  doc.addPage();
  yPosition = margin;
  
  doc.setFont('courier', 'bold');
  doc.text('NOTE (V.O.)', pageWidth / 2 - 20, yPosition);
  yPosition += lineHeight;
  
  doc.setFont('courier', 'normal');
  const noteText = [
    'Sarah, if you\'re reading this,',
    'you\'ve begun a journey that',
    'started long before you were',
    'born. Follow the compass at',
    'sunset. It will show you the',
    'way. - Your grandfather'
  ];
  
  noteText.forEach(line => {
    doc.text(line, pageWidth / 2 - 40, yPosition);
    yPosition += lineHeight;
  });
  
  yPosition += lineHeight * 2;
  
  const action6 = [
    'Sarah\'s eyes well with tears. She clutches the compass',
    'and note to her chest.'
  ];
  
  action6.forEach(line => {
    doc.text(line, margin, yPosition);
    yPosition += lineHeight;
  });
  
  yPosition += lineHeight * 2;
  
  doc.setFont('courier', 'bold');
  doc.text('SARAH', pageWidth / 2 - 20, yPosition);
  yPosition += lineHeight;
  
  doc.setFont('courier', 'normal');
  const dialogue4 = [
    'Grandfather... I never knew',
    'you, but somehow you knew I\'d',
    'come looking.'
  ];
  
  dialogue4.forEach(line => {
    doc.text(line, pageWidth / 2 - 40, yPosition);
    yPosition += lineHeight;
  });
  
  yPosition += lineHeight * 2;
  
  const action7 = [
    'The sun continues its ascent, painting the sky in',
    'brilliant shades of gold and orange. Sarah stands,',
    'determination replacing uncertainty in her eyes.'
  ];
  
  action7.forEach(line => {
    doc.text(line, margin, yPosition);
    yPosition += lineHeight;
  });
  
  yPosition += lineHeight * 2;
  
  doc.setFont('courier', 'bold');
  doc.text('FADE OUT.', margin, yPosition);
  yPosition += lineHeight * 2;
  
  doc.text('THE END', pageWidth / 2, yPosition, { align: 'center' });
  
  // Page 5 - Additional Notes
  doc.addPage();
  yPosition = margin;
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PRODUCTION NOTES', margin, yPosition);
  yPosition += lineHeight * 2;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const productionNotes = [
    'GENRE: Mystery/Drama',
    'RUNTIME: Approximately 10-12 minutes',
    'LOCATIONS: 2 (Coastal cliff, Apartment)',
    'CAST: 1 principal actor, 1 voice actor',
    '',
    'THEMES:',
    '- Family legacy and inheritance',
    '- The search for identity',
    '- Connection across generations',
    '- Mystery and discovery',
    '',
    'VISUAL STYLE:',
    '- Contrast between cramped interior and expansive coastal vistas',
    '- Golden hour lighting for present-day scenes',
    '- Muted, darker tones for flashback sequences',
    '',
    'This demo script is created for testing purposes only.',
    'It demonstrates standard screenplay formatting and structure.'
  ];
  
  productionNotes.forEach(line => {
    doc.text(line, margin, yPosition);
    yPosition += lineHeight;
  });
  
  return doc;
};

export const downloadDemoScript = () => {
  const doc = createDemoScript();
  doc.save('demo_script_golden_horizon.pdf');
};