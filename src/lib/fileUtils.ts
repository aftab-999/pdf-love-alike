
import { PDFDocument } from 'pdf-lib';

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

// Actual PDF compression function
export const compressPDF = async (file: File, compressionLevel: string): Promise<Blob> => {
  try {
    // Read the PDF file
    const fileArrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(fileArrayBuffer);
    
    // Apply compression based on the level
    const compressionOptions: { [key: string]: any } = {
      low: { quality: 0.9, useObjectStreams: true },
      medium: { quality: 0.75, useObjectStreams: true },
      high: { quality: 0.5, useObjectStreams: true },
      extreme: { quality: 0.3, useObjectStreams: true },
      maximum: { quality: 0.1, useObjectStreams: true }
    };
    
    // Get the appropriate options
    const options = compressionOptions[compressionLevel] || compressionOptions.medium;
    
    // Compress and save the PDF
    const compressedPdfBytes = await pdfDoc.save({
      ...options,
      addDefaultPage: false,
      useObjectStreams: true
    });
    
    // Create a new Blob from the compressed bytes
    return new Blob([compressedPdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error compressing PDF:', error);
    throw new Error('PDF compression failed');
  }
};

// Compress to exact target size
export const compressPDFToTargetSize = async (file: File, targetSizeKB: number): Promise<Blob> => {
  // Calculate the compression percentage needed
  const compressionPercentage = getCompressionForExactTargetSize(file.size, targetSizeKB);
  
  // Determine compression level based on percentage
  let compressionLevel = "medium";
  if (compressionPercentage > 90) compressionLevel = "maximum";
  else if (compressionPercentage > 80) compressionLevel = "extreme";
  else if (compressionPercentage > 60) compressionLevel = "high";
  else if (compressionPercentage > 30) compressionLevel = "medium";
  else compressionLevel = "low";
  
  // Compress the PDF
  return compressPDF(file, compressionLevel);
};
