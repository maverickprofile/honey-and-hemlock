import React, { useState, useEffect, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Download, Save, FileText, Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import JudgeRubricForm from './JudgeRubricForm';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Detect iOS Safari
const isIOSSafari = () => {
  const ua = window.navigator.userAgent;
  const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
  const webkit = !!ua.match(/WebKit/i);
  const iOSSafari = iOS && webkit && !ua.match(/CriOS/i);
  return iOSSafari;
};

// Detect any Safari browser
const isSafari = () => {
  const ua = window.navigator.userAgent;
  return /^((?!chrome|android).)*safari/i.test(ua);
};

// Set up the worker for react-pdf with Safari compatibility
if (typeof window !== 'undefined' && 'Worker' in window) {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
}

interface PDFViewerProps {
  scriptId: string;
  scriptTitle: string;
  fileUrl: string;
  reviewId?: string;
  scriptAmount?: number;
  tierName?: string;
  pageCount?: number;
  onClose: () => void;
}

interface PageNote {
  page_number: number;
  note_content: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  scriptId,
  scriptTitle,
  fileUrl,
  reviewId,
  scriptAmount,
  tierName,
  pageCount,
  onClose
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [pageNotes, setPageNotes] = useState<{ [key: number]: string }>({});
  const [currentNote, setCurrentNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [pdfError, setPdfError] = useState<string>('');
  const [containerWidth, setContainerWidth] = useState<number>(800);
  const [useFallback, setUseFallback] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Detect mobile and Safari on mount
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth <= 768);
      // Use fallback ONLY for Safari browsers
      const shouldUseFallback = isIOSSafari() || isSafari();
      setUseFallback(shouldUseFallback);

      // For Safari, set a default number of pages if not already set
      if (shouldUseFallback && pageCount) {
        setNumPages(pageCount || 120); // Use pageCount prop or default to 120
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, [pageCount]);

  // Validate and process the file URL
  useEffect(() => {
    const validateAndSetPdfUrl = async () => {
      setLoading(true);
      setPdfError('');

      // Check if fileUrl is a valid URL
      if (!fileUrl) {
        setPdfError('No file URL provided');
        setLoading(false);
        return;
      }

      // Check if it's a placeholder URL
      if (fileUrl.includes('example.com') || fileUrl === 'https://example.com/test.pdf') {
        console.log('Placeholder URL detected, using sample PDF');
        // Use a sample PDF for testing
        setPdfUrl('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
        // Don't set loading to false here - let the Document component handle it
        toast({
          title: "Using Sample PDF",
          description: "This script has a test URL. Loading a sample PDF for demonstration.",
        });
      } else if (fileUrl.startsWith('https://zknmzaowomihtrtqleon.supabase.co/storage/')) {
        // It's a Supabase storage URL, use it directly
        setPdfUrl(fileUrl);
        // Don't set loading to false here - let the Document component handle it
      } else if (fileUrl.startsWith('http')) {
        // It's some other URL, try to use it
        setPdfUrl(fileUrl);
        // Don't set loading to false here - let the Document component handle it
      } else {
        // Invalid URL format, use sample PDF
        setPdfUrl('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
        // Don't set loading to false here - let the Document component handle it
        toast({
          title: "Invalid File URL",
          description: "Using a sample PDF for demonstration.",
          variant: "destructive"
        });
      }
    };

    validateAndSetPdfUrl();
  }, [fileUrl]);

  // Calculate container width based on viewport
  useEffect(() => {
    const calculateWidth = () => {
      // Account for notes panel (384px) and some padding
      const availableWidth = window.innerWidth - 400;
      setContainerWidth(Math.min(availableWidth * 0.9, 1200));
    };
    
    calculateWidth();
    window.addEventListener('resize', calculateWidth);
    return () => window.removeEventListener('resize', calculateWidth);
  }, []);

  // Load existing notes when component mounts
  useEffect(() => {
    if (reviewId) {
      loadExistingNotes();
    }
  }, [reviewId]);

  // Update current note when page changes
  useEffect(() => {
    setCurrentNote(pageNotes[pageNumber] || '');
  }, [pageNumber, pageNotes]);

  const loadExistingNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('script_page_notes')
        .select('page_number, note_content')
        .eq('script_review_id', reviewId);

      if (error) throw error;

      const notesMap: { [key: number]: string } = {};
      data?.forEach(note => {
        notesMap[note.page_number] = note.note_content || '';
      });
      setPageNotes(notesMap);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log('PDF loaded successfully with', numPages, 'pages');
    setNumPages(numPages);
    setLoading(false);
    // For Safari, ensure page number is valid
    if (pageNumber > numPages) {
      setPageNumber(1);
    }
  };

  const saveNoteForPage = async () => {
    if (!reviewId) {
      toast({
        title: "Error",
        description: "No review ID found. Please start a review first.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      // Check if note already exists for this page
      const { data: existingNote } = await supabase
        .from('script_page_notes')
        .select('id')
        .eq('script_review_id', reviewId)
        .eq('page_number', pageNumber)
        .single();

      if (existingNote) {
        // Update existing note
        const { error } = await supabase
          .from('script_page_notes')
          .update({ note_content: currentNote })
          .eq('id', existingNote.id);

        if (error) throw error;
      } else if (currentNote.trim()) {
        // Insert new note only if there's content
        const { error } = await supabase
          .from('script_page_notes')
          .insert({
            script_review_id: reviewId,
            page_number: pageNumber,
            note_content: currentNote
          });

        if (error) throw error;
      }

      // Update local state
      setPageNotes(prev => ({
        ...prev,
        [pageNumber]: currentNote
      }));

      toast({
        title: "Note saved",
        description: `Note for page ${pageNumber} has been saved`,
      });
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    // Save current note before changing page
    if (currentNote !== pageNotes[pageNumber]) {
      saveNoteForPage();
    }
    setPageNumber(newPage);
    // Load the note for the new page
    setCurrentNote(pageNotes[newPage] || '');
  };

  const downloadScript = async () => {
    try {
      // Get a signed URL for download
      const { data, error } = await supabase.storage
        .from('scripts')
        .createSignedUrl(fileUrl, 3600); // 1 hour expiry

      if (error) throw error;

      // Open in new tab for download
      window.open(data.signedUrl, '_blank');
      
      toast({
        title: "Download started",
        description: "Your script is being downloaded",
      });
    } catch (error) {
      console.error('Error downloading script:', error);
      toast({
        title: "Error",
        description: "Failed to download script",
        variant: "destructive"
      });
    }
  };

  // Auto-save note when user stops typing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentNote !== pageNotes[pageNumber] && currentNote !== '') {
        saveNoteForPage();
      }
    }, 2000); // Auto-save after 2 seconds of no typing

    return () => clearTimeout(timeoutId);
  }, [currentNote]);

  return (
    <div className="fixed inset-0 z-50 bg-portfolio-black overflow-y-auto">
      <div className="min-h-full">
        {/* PDF and Notes Container - Stack on mobile */}
        <div className={`${isMobile ? 'flex flex-col' : 'flex'}`} style={{ minHeight: '100vh' }}>
          {/* PDF Viewer Section */}
          <div className="flex-1 flex flex-col bg-gray-900 min-w-0">
        {/* Header */}
        <div className="bg-portfolio-dark border-b border-portfolio-gold/20 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate('/contractor-dashboard')}
                className="text-portfolio-white hover:text-portfolio-gold hover:bg-portfolio-white/10 p-1 sm:p-2"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <h2 className="text-base sm:text-xl font-semibold text-portfolio-gold truncate max-w-[180px] sm:max-w-none">{scriptTitle}</h2>
                <span className="text-portfolio-white/60 text-xs sm:text-sm">
                  Page {pageNumber} of {numPages}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setScale(scale - 0.1)}
                disabled={scale <= 0.5}
                className="bg-portfolio-black text-portfolio-white border border-portfolio-gold hover:bg-portfolio-gold hover:text-portfolio-black transition-all duration-300 hidden sm:inline-flex"
              >
                Zoom -
              </Button>
              <span className="text-portfolio-white px-2 text-sm hidden sm:inline">{Math.round(scale * 100)}%</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setScale(scale + 0.1)}
                disabled={scale >= 2}
                className="bg-portfolio-black text-portfolio-white border border-portfolio-gold hover:bg-portfolio-gold hover:text-portfolio-black transition-all duration-300 hidden sm:inline-flex"
              >
                Zoom +
              </Button>
              <Button
                size="sm"
                onClick={downloadScript}
                className="bg-portfolio-black text-portfolio-gold border-2 border-portfolio-gold hover:bg-portfolio-gold hover:text-portfolio-black font-semibold transition-all duration-300 text-xs sm:text-sm"
              >
                <Download className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Download</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onClose}
                className="bg-portfolio-white text-portfolio-black border-2 border-portfolio-white hover:bg-portfolio-black hover:text-portfolio-gold hover:border-portfolio-gold font-semibold transition-all duration-300"
              >
                Submit Review
              </Button>
            </div>
          </div>
        </div>

        {/* PDF Document */}
        <div className="flex-1 overflow-hidden p-2 sm:p-4">
          {loading && !pdfUrl && !pdfError && (
            <div className="w-full h-full flex justify-center items-center">
              <div className="flex flex-col items-center">
                <Loader2 className="w-8 h-8 animate-spin text-portfolio-gold" />
                <p className="text-portfolio-white mt-2">Loading PDF...</p>
              </div>
            </div>
          )}
          {pdfError && (
            <div className="w-full h-full flex justify-center items-center">
              <div className="flex flex-col items-center text-portfolio-white">
                <p className="text-red-500 mb-4">{pdfError}</p>
                <p>Unable to load the PDF file.</p>
              </div>
            </div>
          )}
          {pdfUrl && !pdfError && (
            <div className="w-full h-full overflow-auto">
              {/* Use iframe fallback for Safari/iOS */}
              {useFallback ? (
                <div className="w-full h-full flex flex-col">
                  <iframe
                    key={pageNumber} // Force reload when page changes
                    src={`${pdfUrl}#page=${pageNumber}`}
                    className="w-full flex-1 border-0"
                    style={{ minHeight: isMobile ? '400px' : '600px' }}
                    title={`${scriptTitle} - Page ${pageNumber}`}
                    onLoad={() => setLoading(false)}
                  />
                </div>
              ) : (
                <div className="flex justify-center p-2 sm:p-4">
                  <div style={{ maxWidth: '100%', overflow: 'auto' }}>
                    <Document
                      file={pdfUrl}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={(error) => {
                        console.error('PDF Load Error:', error);
                        // Try fallback on error
                        if (!useFallback) {
                          setUseFallback(true);
                          toast({
                            title: "Switching to fallback viewer",
                            description: "Using alternative PDF viewer for better compatibility.",
                          });
                        } else {
                          setPdfError('Failed to load PDF file. Please try again.');
                        }
                        setLoading(false);
                      }}
                      className="flex justify-center"
                      options={{
                        cMapUrl: `//unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
                        cMapPacked: true,
                      }}
                    >
                      <Page
                        pageNumber={pageNumber}
                        scale={isMobile ? 0.6 : scale}
                        className="shadow-2xl"
                        renderTextLayer={!isMobile}
                        renderAnnotationLayer={!isMobile}
                        width={isMobile ? undefined : containerWidth}
                      />
                    </Document>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation - Always visible for page-by-page notes */}
        <div className="bg-portfolio-dark border-t border-portfolio-gold/20 p-3 sm:p-4">
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            <Button
              onClick={() => handlePageChange(Math.max(1, pageNumber - 1))}
              disabled={pageNumber <= 1}
              className="bg-portfolio-black text-portfolio-gold border-2 border-portfolio-gold hover:bg-portfolio-gold hover:text-portfolio-black font-semibold transition-all duration-300 disabled:opacity-50 disabled:hover:bg-portfolio-black disabled:hover:text-portfolio-gold text-xs sm:text-sm px-2 sm:px-4"
            >
              <ChevronLeft className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            <div className="hidden sm:flex items-center space-x-2">
              {Array.from({ length: Math.min(5, numPages || 0) }, (_, i) => {
                const page = Math.max(1, Math.min(pageNumber - 2 + i, (numPages || 1) - 4)) + i;
                if (page > (numPages || 0)) return null;
                return (
                  <Button
                    key={page}
                    size="sm"
                    variant={page === pageNumber ? "default" : "outline"}
                    onClick={() => handlePageChange(page)}
                    className={page === pageNumber
                      ? "bg-portfolio-gold text-portfolio-black font-semibold border-2 border-portfolio-gold"
                      : "bg-portfolio-black text-portfolio-white border border-portfolio-gold/50 hover:bg-portfolio-gold hover:text-portfolio-black transition-all duration-300"}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>

            <Button
              onClick={() => handlePageChange(Math.min(numPages || 120, pageNumber + 1))}
              disabled={!numPages || pageNumber >= numPages}
              className="bg-portfolio-black text-portfolio-gold border-2 border-portfolio-gold hover:bg-portfolio-gold hover:text-portfolio-black font-semibold transition-all duration-300 disabled:opacity-50 disabled:hover:bg-portfolio-black disabled:hover:text-portfolio-gold text-xs sm:text-sm px-2 sm:px-4"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4 sm:ml-2" />
            </Button>
          </div>
          <div className="text-center mt-2">
            <div className="text-portfolio-gold font-bold text-base sm:text-lg mb-1">
              Page {pageNumber} of {numPages || '...'}
            </div>
            <div className="text-portfolio-white/60 text-xs sm:text-sm">
              Use navigation buttons to change pages and save notes for each page
            </div>
          </div>
        </div>
      </div>

          {/* Notes Section - Make responsive */}
          <div className={`${isMobile ? 'w-full' : 'w-96'} bg-portfolio-dark ${isMobile ? 'border-t' : 'border-l'} border-portfolio-gold/20 flex flex-col flex-shrink-0`}>
            <Card className="bg-transparent border-none h-full flex flex-col">
          <CardHeader className="border-b border-portfolio-gold/20 p-3 sm:p-6">
            <CardTitle className="text-portfolio-gold flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Notes for Page {pageNumber}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-3 sm:p-4">
            <Textarea
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              placeholder="Add your notes for this page here. There's no character limit - write as much as you need."
              className="flex-1 bg-portfolio-black border-portfolio-gold/30 text-portfolio-white resize-none min-h-[150px] sm:min-h-[200px]"
            />
            <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="text-xs sm:text-sm text-portfolio-white/60">
                {currentNote.length > 0 && `${currentNote.length} characters`}
              </div>
              <Button
                onClick={saveNoteForPage}
                disabled={saving}
                className="bg-portfolio-black text-portfolio-gold border-2 border-portfolio-gold hover:bg-portfolio-gold hover:text-portfolio-black font-semibold transition-all duration-300 w-full sm:w-auto text-sm"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Note
                  </>
                )}
              </Button>
            </div>
            
            {/* Indicator for pages with notes */}
            <div className="mt-4 pt-4 border-t border-portfolio-gold/20">
              <p className="text-xs sm:text-sm text-portfolio-white/60 mb-2">Pages with notes:</p>
              <div className="flex flex-wrap gap-1 sm:gap-2 max-h-24 overflow-y-auto">
                {Object.keys(pageNotes).map(page => (
                  <Button
                    key={page}
                    size="sm"
                    variant="outline"
                    onClick={() => handlePageChange(parseInt(page))}
                    className="bg-portfolio-black text-portfolio-gold border border-portfolio-gold/50 hover:bg-portfolio-gold hover:text-portfolio-black transition-all duration-300 text-xs px-2 py-1"
                  >
                    Pg {page}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
          </div>
        </div>
        
        {/* Judge's Rubric Form - Below PDF Viewer */}
        {/* Same rubric for all tiers - page notes handled separately in sidebar */}
        {reviewId && (
          <JudgeRubricForm
            scriptTitle={scriptTitle}
            reviewId={reviewId}
          />
        )}
      </div>
    </div>
  );
};

export default PDFViewer;