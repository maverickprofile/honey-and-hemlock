import jsPDF from 'jspdf';
import { preloadPDFLogos } from './pdfImageHelper';

interface RubricData {
  script: {
    title: string;
    author_name: string;
    author_email: string;
    tier_name: string;
    amount?: number;
  };
  contractor?: {
    name: string;
  };
  created_at: string;
  recommendation: string;
  overall_notes?: string;
  feedback?: string;
  title_response?: string;

  // Rubric ratings (1-5 scale)
  plot_rating?: number;
  plot_notes?: string;
  characters_rating?: number;
  character_notes?: string;
  concept_originality_rating?: number;
  concept_originality_notes?: string;
  structure_rating?: number;
  structure_notes?: string;
  dialogue_rating?: number;
  dialogue_notes?: string;
  format_pacing_rating?: number;
  format_pacing_notes?: string;
  theme_rating?: number;
  theme_tone_notes?: string;
  catharsis_rating?: number;
  catharsis_notes?: string;
  production_budget_rating?: number;
  production_budget_notes?: string;

  // Page notes for detailed reviews
  pageNotes?: Array<{
    page_number: number;
    note: string;
  }>;

}

export const exportRubricToPDF = async (rubricData: RubricData) => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Preload logos
  const logos = await preloadPDFLogos();

  // Colors - maintaining gold accent color
  const goldColor = [212, 175, 55]; // Portfolio gold
  const darkColor = [20, 20, 20]; // Dark text
  const lightTextColor = [120, 120, 120]; // Lighter gray for secondary text

  let yPosition = 20;
  const leftMargin = 20;
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const contentWidth = pageWidth - 40;
  const lineHeight = 7;

  // Helper function to add a new page if needed
  const checkPageBreak = (neededSpace: number = 30) => {
    if (yPosition + neededSpace > pageHeight - 40) {
      pdf.addPage();
      yPosition = 20;
      return true;
    }
    return false;
  };

  // Helper function to wrap text
  const wrapText = (text: string, maxWidth: number): string[] => {
    const lines = pdf.splitTextToSize(text, maxWidth);
    return lines;
  };

  // Helper function to draw rating (minimalist style)
  const drawRating = (rating: number, x: number, y: number, maxRating: number = 5) => {
    pdf.setTextColor(...goldColor);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${rating}/${maxRating}`, x, y);
  };

  // HEADER WITH HONEY WRITES LOGO
  if (logos.honeyWrites) {
    try {
      // Add logo at the top center (larger size for better visibility)
      const logoWidth = 70;
      const logoHeight = 40;
      const logoX = (pageWidth - logoWidth) / 2;
      pdf.addImage(logos.honeyWrites, 'PNG', logoX, 10, logoWidth, logoHeight);
      yPosition = 55;
    } catch (error) {
      console.error('Error adding header logo:', error);
      yPosition = 20;
    }
  }

  // Title (clean typography, no background)
  pdf.setTextColor(...darkColor);
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Script Review Rubric', pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 8;
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...lightTextColor);
  pdf.text('Professional Script Analysis', pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 20;

  // SCRIPT INFORMATION - Clean section header without bar
  pdf.setTextColor(...goldColor);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('SCRIPT INFORMATION', leftMargin, yPosition);

  yPosition += 10;
  pdf.setTextColor(...darkColor);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);

  const scriptInfo = [
    ['Title:', rubricData.script.title],
    ['Author:', rubricData.script.author_name],
    ['Email:', rubricData.script.author_email],
    ['Tier:', rubricData.script.tier_name],
    ['Review Fee:', rubricData.script.amount ? `$${rubricData.script.amount}` : 'N/A']
  ];

  scriptInfo.forEach(([label, value]) => {
    pdf.setFont('helvetica', 'bold');
    pdf.text(label, leftMargin, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(value || 'N/A', leftMargin + 30, yPosition);
    yPosition += lineHeight;
  });

  yPosition += 10;

  // REVIEWER INFORMATION - Clean section header
  pdf.setTextColor(...goldColor);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('REVIEWER INFORMATION', leftMargin, yPosition);

  yPosition += 10;
  pdf.setTextColor(...darkColor);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Reviewer:', leftMargin, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(rubricData.contractor?.name || 'Unknown', leftMargin + 30, yPosition);
  yPosition += lineHeight;

  pdf.setFont('helvetica', 'bold');
  pdf.text('Review Date:', leftMargin, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(new Date(rubricData.created_at).toLocaleDateString(), leftMargin + 30, yPosition);
  yPosition += lineHeight;

  pdf.setFont('helvetica', 'bold');
  pdf.text('Status:', leftMargin, yPosition);
  const statusText = (rubricData.recommendation === 'approved' || rubricData.recommendation === 'declined' || rubricData.recommendation === 'completed')
    ? 'COMPLETED'
    : 'IN PROGRESS';
  const statusColor = statusText === 'COMPLETED' ? [34, 139, 34] : [255, 140, 0];
  pdf.setTextColor(...statusColor);
  pdf.setFont('helvetica', 'bold');
  pdf.text(statusText, leftMargin + 30, yPosition);
  pdf.setTextColor(...darkColor);

  yPosition += 15;

  // OVERALL ASSESSMENT - Clean section header
  if (rubricData.overall_notes) {
    checkPageBreak();
    pdf.setTextColor(...goldColor);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('OVERALL ASSESSMENT', leftMargin, yPosition);

    yPosition += 10;
    pdf.setTextColor(...darkColor);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);

    const overallLines = wrapText(rubricData.overall_notes, contentWidth);
    overallLines.forEach(line => {
      checkPageBreak(10);
      pdf.text(line, leftMargin, yPosition);
      yPosition += lineHeight;
    });

    yPosition += 10;
  }

  // RUBRIC ASSESSMENT - Clean section header
  const rubricSections = [
    {
      title: 'Plot',
      rating: rubricData.plot_rating,
      notes: rubricData.plot_notes,
      description: 'Events contain conflict, logic, and flow'
    },
    {
      title: 'Characters',
      rating: rubricData.characters_rating,
      notes: rubricData.character_notes,
      description: 'Authentic, unique characters with satisfying arcs'
    },
    {
      title: 'Concept/Originality',
      rating: rubricData.concept_originality_rating,
      notes: rubricData.concept_originality_notes,
      description: 'Fresh story with unexpected details'
    },
    {
      title: 'Structure',
      rating: rubricData.structure_rating,
      notes: rubricData.structure_notes,
      description: 'Connective, logical story that builds emotionally'
    },
    {
      title: 'Dialogue',
      rating: rubricData.dialogue_rating,
      notes: rubricData.dialogue_notes,
      description: 'Believable, unique character voices'
    },
    {
      title: 'Format/Pacing',
      rating: rubricData.format_pacing_rating,
      notes: rubricData.format_pacing_notes,
      description: 'Professional formatting and appropriate pacing'
    },
    {
      title: 'Theme/Tone',
      rating: rubricData.theme_rating,
      notes: rubricData.theme_tone_notes,
      description: 'Interesting perspective on human issues'
    },
    {
      title: 'Catharsis',
      rating: rubricData.catharsis_rating,
      notes: rubricData.catharsis_notes,
      description: 'Satisfactory ending with emotional completion'
    },
    {
      title: 'Production Budget',
      rating: rubricData.production_budget_rating,
      notes: rubricData.production_budget_notes,
      description: 'Budget considerations (1=High, 6=Low)',
      maxRating: 6
    }
  ];

  // Check if we need to start rubric scores on a new page
  checkPageBreak(40);

  pdf.setTextColor(...goldColor);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('RUBRIC ASSESSMENT', leftMargin, yPosition);
  yPosition += 12;

  rubricSections.forEach((section) => {
    if (section.rating || section.notes) {
      checkPageBreak(25);

      // Section title and rating on same line
      pdf.setTextColor(...darkColor);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.text(section.title, leftMargin, yPosition);

      if (section.rating) {
        drawRating(section.rating, leftMargin + contentWidth - 20, yPosition, section.maxRating || 5);
      }

      yPosition += 5;

      // Description in lighter text
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(9);
      pdf.setTextColor(...lightTextColor);
      pdf.text(section.description, leftMargin, yPosition);
      yPosition += 6;

      // Notes
      if (section.notes) {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(...darkColor);
        const noteLines = wrapText(section.notes, contentWidth);
        noteLines.forEach(line => {
          checkPageBreak(10);
          pdf.text(line, leftMargin, yPosition);
          yPosition += lineHeight;
        });
      }

      yPosition += 8;
    }
  });

  // PAGE-BY-PAGE NOTES - Clean section header
  if (rubricData.pageNotes && rubricData.pageNotes.length > 0) {
    checkPageBreak(40);
    yPosition += 10;

    pdf.setTextColor(...goldColor);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PAGE-BY-PAGE NOTES', leftMargin, yPosition);

    yPosition += 12;

    rubricData.pageNotes.forEach(pageNote => {
      checkPageBreak(20);

      pdf.setTextColor(...goldColor);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text(`Page ${pageNote.page_number}:`, leftMargin, yPosition);
      yPosition += 5;

      pdf.setTextColor(...darkColor);
      pdf.setFont('helvetica', 'normal');
      const noteLines = wrapText(pageNote.note, contentWidth);
      noteLines.forEach(line => {
        checkPageBreak(10);
        pdf.text(line, leftMargin, yPosition);
        yPosition += lineHeight;
      });

      yPosition += 5;
    });
  }

  // FOOTER WITH HONEY & HEMLOCK LOGO on all pages
  const pageCount = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);

    // Add Honey & Hemlock logo in footer
    if (logos.honeyHemlock) {
      try {
        const footerLogoWidth = 35;
        const footerLogoHeight = 35;
        const footerLogoX = (pageWidth - footerLogoWidth) / 2;
        const footerLogoY = pageHeight - 45;
        pdf.addImage(logos.honeyHemlock, 'PNG', footerLogoX, footerLogoY, footerLogoWidth, footerLogoHeight);
      } catch (error) {
        console.error('Error adding footer logo:', error);
      }
    }

    // Page numbers - smaller and subtle
    pdf.setFontSize(8);
    pdf.setTextColor(...lightTextColor);
    pdf.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Generate filename
  const scriptTitle = rubricData.script.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const date = new Date().toISOString().split('T')[0];
  const filename = `rubric_${scriptTitle}_${date}.pdf`;

  // Save the PDF
  pdf.save(filename);
};