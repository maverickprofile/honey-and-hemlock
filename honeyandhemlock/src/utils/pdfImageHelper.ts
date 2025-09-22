// Helper function to load image as base64 for PDF embedding
export const loadImageAsBase64 = async (imagePath: string): Promise<string> => {
  try {
    const response = await fetch(imagePath);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        resolve(base64data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error loading image:', error);
    return '';
  }
};

// Pre-load logos for PDF generation
export const preloadPDFLogos = async () => {
  const logos = {
    honeyWrites: '',
    honeyHemlock: ''
  };

  try {
    // Load Honey Writes logo
    logos.honeyWrites = await loadImageAsBase64('/Honey Writes-35 (1).png');

    // Load Honey & Hemlock main logo
    logos.honeyHemlock = await loadImageAsBase64('/logo4 transparent.png');
  } catch (error) {
    console.error('Error preloading logos:', error);
  }

  return logos;
};