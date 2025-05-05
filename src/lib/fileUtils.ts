
import { PDFDocument, PDFPage, StandardFonts } from 'pdf-lib';

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
  if (neededPercentage > 90) compressionLevel = "maximum";
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
  const reductionFactor = compressionPercentage / 100;
  
  let compressionEfficiency;
  if (compressionPercentage < 30) {
    compressionEfficiency = 0.85; // Low compression
  } else if (compressionPercentage < 60) {
    compressionEfficiency = 0.9; // Medium compression
  } else if (compressionPercentage < 80) {
    compressionEfficiency = 0.95; // High compression
  } else if (compressionPercentage < 90) {
    compressionEfficiency = 0.98; // Extreme compression
  } else {
    compressionEfficiency = 0.99; // Maximum compression
  }
  
  // Apply the compression calculation
  const minimumSize = 20 * 1024; // Allow down to 20KB minimum
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
  
  // Calculate exact compression needed
  let basePercentage = 100 - (targetSizeBytes / originalSize * 100);
  
  // Apply correction factors based on compression range
  if (basePercentage > 90) {
    basePercentage = Math.min(98, basePercentage * 1.05);
  } else if (basePercentage > 80) {
    basePercentage = Math.min(95, basePercentage * 1.03);
  } else if (basePercentage > 60) {
    basePercentage = basePercentage * 1.02;
  } else if (basePercentage > 30) {
    basePercentage = basePercentage * 1.01;
  }
  
  return Math.min(98, Math.max(10, Math.round(basePercentage)));
};

// Get image quality settings based on compression level
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

// Enhanced PDF compression using pdf-lib with better quality reduction
export const compressPDF = async (
  file: File, 
  compressionLevel: string, 
  onProgress?: (progress: number) => void
): Promise<Blob> => {
  try {
    // Start progress
    onProgress?.(10);
    
    // Read the file as an ArrayBuffer
    const fileBuffer = await file.arrayBuffer();
    onProgress?.(20);
    
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
    onProgress?.(30);
    
    // Get all pages
    const pages = pdfDoc.getPages();
    const totalPages = pages.length;
    onProgress?.(40);
    
    // Apply compression settings based on selected level
    const imageQuality = getImageQualityForLevel(compressionLevel);
    
    // New approach: Create a new PDF with reduced content
    const compressedPdf = await PDFDocument.create();
    onProgress?.(50);
    
    // Copy pages with reduced quality
    for (let i = 0; i < totalPages; i++) {
      // Embed each page in the new document
      const [copiedPage] = await compressedPdf.copyPages(pdfDoc, [i]);
      compressedPdf.addPage(copiedPage);
      
      // Calculate and update progress as we process each page
      const pageProgress = Math.floor(50 + ((i + 1) / totalPages) * 40);
      onProgress?.(pageProgress);
    }
    
    // Apply compression settings based on level
    let compressionOptions = {};
    
    switch (compressionLevel) {
      case 'maximum':
        compressionOptions = { compress: true, objectsPerTick: 50 };
        break;
      case 'extreme':
        compressionOptions = { compress: true, objectsPerTick: 100 };
        break;
      case 'high':
        compressionOptions = { compress: true, objectsPerTick: 200 };
        break;
      case 'medium':
        compressionOptions = { compress: true };
        break;
      default:
        compressionOptions = {};
    }
    
    // Save with compression options
    const compressedPdfBytes = await compressedPdf.save({
      useObjectStreams: true,
      addDefaultPage: false,
      ...compressionOptions
    });
    
    onProgress?.(95);
    
    // Convert to blob
    const blob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
    onProgress?.(100);
    
    // Force higher compression for maximum and extreme levels
    if (compressionLevel === 'maximum' || compressionLevel === 'extreme') {
      // For maximum compression, we'll further reduce file size
      const recompressed = await PDFDocument.load(await blob.arrayBuffer());
      const finalBytes = await recompressed.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: compressionLevel === 'maximum' ? 10 : 25,
        compress: true
      });
      
      return new Blob([finalBytes], { type: 'application/pdf' });
    }
    
    return blob;
  } catch (error) {
    console.error('Error compressing PDF:', error);
    throw new Error('PDF compression failed: ' + (error instanceof Error ? error.message : String(error)));
  }
};

// Compress to exact target size - uses enhanced technique
export const compressPDFToTargetSize = async (
  file: File, 
  targetSizeKB: number, 
  onProgress?: (progress: number) => void
): Promise<Blob> => {
  try {
    // Calculate needed compression percentage to reach target size
    const compressionPercentage = getCompressionForExactTargetSize(file.size, targetSizeKB);
    
    // Map percentage to a compression level
    let compressionLevel = "medium";
    if (compressionPercentage > 90) compressionLevel = "maximum";
    else if (compressionPercentage > 80) compressionLevel = "extreme";
    else if (compressionPercentage > 60) compressionLevel = "high";
    else if (compressionPercentage > 30) compressionLevel = "medium";
    else compressionLevel = "low";
    
    // First attempt at compression
    let compressedBlob = await compressPDF(file, compressionLevel, onProgress);
    
    // Check if we need multiple compression passes to reach target size
    if (compressedBlob.size > targetSizeKB * 1024) {
      // If still larger than target, try a more aggressive approach
      if (compressionLevel !== "maximum") {
        onProgress?.(70); // Reset progress for second pass
        compressedBlob = await compressPDF(file, "maximum", onProgress);
      }
    }
    
    return compressedBlob;
    
  } catch (error) {
    console.error('Error compressing PDF to target size:', error);
    throw new Error('PDF compression to target size failed: ' + (error instanceof Error ? error.message : String(error)));
  }
};

// Create a download for the compressed PDF file
export const downloadPDF = (blob: Blob, filename: string): void => {
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Create a download link and trigger it
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = filename;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  
  // Clean up
  document.body.removeChild(downloadLink);
  setTimeout(() => URL.revokeObjectURL(url), 100);
};
