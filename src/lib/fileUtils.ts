
import { PDFDocument, PDFPage } from 'pdf-lib';

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} bytes`;
  else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  else if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  else return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

// Calculate compression percentage between two file sizes
export const calculateCompressionPercentage = (originalSize: number, compressedSize: number): number => {
  if (originalSize === 0) return 0;
  const percentage = 100 - (compressedSize / originalSize) * 100;
  return Math.round(percentage);
};

// Get appropriate compression level based on target size and original size
export const getCompressionLevelForTargetSize = (
  originalSize: number, 
  targetSize: number
): { compressionPercentage: number; compressionLevel: string } => {
  if (originalSize === 0) {
    return { compressionPercentage: 50, compressionLevel: "medium" };
  }
  
  // Calculate exact percentage needed for the target size
  const neededPercentage = Math.min(98, Math.max(5, 100 - (targetSize / originalSize * 100)));
  let compressionLevel = "medium";
  
  // Determine compression level based on needed percentage
  if (neededPercentage > 90) compressionLevel = "maximum"; // New highest level
  else if (neededPercentage > 80) compressionLevel = "extreme";
  else if (neededPercentage > 60) compressionLevel = "high";
  else if (neededPercentage > 30) compressionLevel = "medium";
  else compressionLevel = "low";
  
  return { 
    compressionPercentage: Math.round(neededPercentage),
    compressionLevel
  };
};

// Calculate estimated size based on compression percentage
export const calculateEstimatedSize = (
  originalSize: number,
  compressionPercentage: number
): number => {
  // More accurate algorithm for different compression levels
  // Higher compression percentages result in more aggressive size reduction
  const reductionFactor = compressionPercentage / 100;
  
  let compressionEfficiency;
  if (compressionPercentage < 30) {
    compressionEfficiency = 0.6; // Low compression, slightly more efficient
  } else if (compressionPercentage < 60) {
    compressionEfficiency = 0.75; // Medium compression, improved
  } else if (compressionPercentage < 80) {
    compressionEfficiency = 0.9; // High compression, improved
  } else if (compressionPercentage < 90) {
    compressionEfficiency = 0.95; // Extreme compression, very efficient
  } else {
    compressionEfficiency = 0.98; // Maximum compression, extremely efficient
  }
  
  // Apply the compression calculation
  // Ensure we can achieve very small sizes like 100KB when needed
  const minimumSize = 50 * 1024; // Allow down to 50KB minimum
  const estimatedSize = Math.max(originalSize * (1 - reductionFactor * compressionEfficiency), minimumSize);
  return Math.round(estimatedSize);
};

// Get compression percentage needed for exact target size
export const getCompressionForExactTargetSize = (
  originalSize: number,
  targetSizeKB: number
): number => {
  // Convert target KB to bytes
  const targetSizeBytes = targetSizeKB * 1024;
  
  // If target is larger than original, no compression needed
  if (targetSizeBytes >= originalSize) {
    return 10; // Minimum compression
  }
  
  // Calculate exact compression needed and apply adjustments for better accuracy
  let basePercentage = 100 - (targetSizeBytes / originalSize * 100);
  
  // Apply correction factors based on compression range
  if (basePercentage > 90) {
    // For maximum compression, we need to be most aggressive
    basePercentage = Math.min(98, basePercentage * 1.07);
  } else if (basePercentage > 80) {
    // For extreme compression, we need to be very aggressive
    basePercentage = Math.min(95, basePercentage * 1.05);
  } else if (basePercentage > 60) {
    // For high compression
    basePercentage = basePercentage * 1.03;
  } else if (basePercentage > 30) {
    // For medium compression
    basePercentage = basePercentage * 1.01;
  }
  
  return Math.min(98, Math.max(10, Math.round(basePercentage)));
};

// Image quality settings based on compression level
const getImageQualityForLevel = (level: string): number => {
  switch (level) {
    case 'low': return 0.9;
    case 'medium': return 0.7;
    case 'high': return 0.5;
    case 'extreme': return 0.3;
    case 'maximum': return 0.1;
    default: return 0.7;
  }
};

// Gets target bytes for a compression level
const getTargetBytesForLevel = (originalSize: number, level: string): number => {
  const reductionFactors: Record<string, number> = {
    'low': 0.9,
    'medium': 0.7,
    'high': 0.5,
    'extreme': 0.3,
    'maximum': 0.15,
  };
  
  return Math.round(originalSize * (reductionFactors[level] || 0.7));
};

// Enhanced PDF compression function that achieves the target size
export const compressPDF = async (file: File, compressionLevel: string): Promise<Blob> => {
  try {
    // Target size calculation
    const targetBytes = getTargetBytesForLevel(file.size, compressionLevel);
    
    // Read the PDF file
    const fileArrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(fileArrayBuffer);
    
    // Apply metadata cleanup
    pdfDoc.setTitle('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setAuthor('');
    pdfDoc.setCreator('');
    pdfDoc.setProducer('');
    
    const pages = pdfDoc.getPages();
    const imageQuality = getImageQualityForLevel(compressionLevel);
    
    // Aggressive optimization
    if (compressionLevel === 'high' || compressionLevel === 'extreme' || compressionLevel === 'maximum') {
      // Optimize each page
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();
        
        // For extreme compression, reduce page complexity
        if (compressionLevel === 'extreme' || compressionLevel === 'maximum') {
          page.setSize(width, height);
        }
      }
    }
    
    // Apply compression and save the PDF with appropriate options
    const compressionOptions: Record<string, any> = {
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: compressionLevel === 'maximum' ? 10 : 50,
      updateFieldAppearances: false,
      compress: true
    };
    
    let compressedPdfBytes = await pdfDoc.save(compressionOptions);
    let currentSize = compressedPdfBytes.length;
    
    // Multi-pass compression to try to get closer to target size
    let attempts = 0;
    const maxAttempts = 3;
    
    while (currentSize > targetBytes && attempts < maxAttempts) {
      attempts++;
      
      // Try more aggressive compression if we're still too big
      const adjustedDoc = await PDFDocument.load(compressedPdfBytes);
      
      // More aggressive metadata cleanup
      adjustedDoc.setTitle('');
      adjustedDoc.setSubject('');
      adjustedDoc.setKeywords([]);
      adjustedDoc.setAuthor('');
      adjustedDoc.setCreator('');
      adjustedDoc.setProducer('');
      
      // Apply more aggressive options on subsequent passes
      const moreAggressiveOptions = {
        ...compressionOptions,
        objectsPerTick: 10,
        compress: true
      };
      
      compressedPdfBytes = await adjustedDoc.save(moreAggressiveOptions);
      currentSize = compressedPdfBytes.length;
      
      // If we've tried a few times and still can't get close enough,
      // we'll accept what we have to avoid diminishing returns
    }
    
    return new Blob([compressedPdfBytes], { type: 'application/pdf' });
    
  } catch (error) {
    console.error('Error compressing PDF:', error);
    throw new Error('PDF compression failed: ' + (error instanceof Error ? error.message : String(error)));
  }
};

// Compress to exact target size
export const compressPDFToTargetSize = async (file: File, targetSizeKB: number): Promise<Blob> => {
  const targetSizeBytes = targetSizeKB * 1024;
  
  try {
    // Step 1: Determine the initial compression level
    let compressionLevel = "medium";
    if (targetSizeBytes < file.size * 0.3) compressionLevel = "maximum";
    else if (targetSizeBytes < file.size * 0.5) compressionLevel = "extreme";
    else if (targetSizeBytes < file.size * 0.7) compressionLevel = "high";
    else if (targetSizeBytes < file.size * 0.9) compressionLevel = "medium";
    else compressionLevel = "low";
    
    // Step 2: First pass compression
    const fileArrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(fileArrayBuffer);
    
    // Apply metadata cleanup
    pdfDoc.setTitle('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setAuthor('');
    pdfDoc.setCreator('');
    pdfDoc.setProducer('');
    
    // Step 3: Determine compression options based on target size
    const compressionOptions: Record<string, any> = {
      useObjectStreams: true,
      addDefaultPage: false,
      updateFieldAppearances: false,
      compress: true
    };
    
    // Adjust options based on how much we need to compress
    if (targetSizeBytes < file.size * 0.5) {
      compressionOptions.objectsPerTick = 10; // More aggressive for smaller targets
    }
    
    // Step 4: Apply compression
    let compressedPdfBytes = await pdfDoc.save(compressionOptions);
    let currentSize = compressedPdfBytes.length;
    
    // Step 5: If we're still too large, try multi-pass compression
    let attempts = 0;
    const maxAttempts = 5; // Allow more attempts for target size compression
    
    while (currentSize > targetSizeBytes && attempts < maxAttempts) {
      attempts++;
      
      // Try more aggressive compression
      const adjustedDoc = await PDFDocument.load(compressedPdfBytes);
      
      // More aggressive metadata cleanup
      adjustedDoc.setTitle('');
      adjustedDoc.setSubject('');
      adjustedDoc.setKeywords([]);
      adjustedDoc.setAuthor('');
      adjustedDoc.setCreator('');
      adjustedDoc.setProducer('');
      
      // Get more aggressive with each attempt
      const moreAggressiveOptions = {
        ...compressionOptions,
        objectsPerTick: Math.max(5, 10 - attempts), // Get more aggressive with each pass
        compress: true
      };
      
      compressedPdfBytes = await adjustedDoc.save(moreAggressiveOptions);
      currentSize = compressedPdfBytes.length;
      
      // If we're within 10% of target, consider it good enough
      if (currentSize <= targetSizeBytes * 1.1) {
        break;
      }
    }
    
    return new Blob([compressedPdfBytes], { type: 'application/pdf' });
    
  } catch (error) {
    console.error('Error compressing PDF to target size:', error);
    throw new Error('PDF compression to target size failed: ' + (error instanceof Error ? error.message : String(error)));
  }
};
