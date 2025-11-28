import JSZip from 'jszip';
import { DrawingPath, PDFFile } from '../types';

// Helper function to download file without external dependencies
const downloadFile = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const saveNote = async (file: PDFFile, annotations: Record<number, DrawingPath[]>) => {
  const zip = new JSZip();
  
  // Add original PDF
  zip.file("document.pdf", file.data);
  
  // Add annotations JSON
  const meta = {
    originalName: file.name,
    createdAt: new Date().toISOString(),
    version: 1
  };
  zip.file("metadata.json", JSON.stringify(meta, null, 2));
  zip.file("annotations.json", JSON.stringify(annotations, null, 2));

  // Generate blob
  const content = await zip.generateAsync({ type: "blob" });
  
  // Trigger download
  const fileName = file.name.endsWith('.pdf') 
    ? file.name.replace('.pdf', '.note') 
    : file.name.endsWith('.note') ? file.name : `${file.name}.note`;
    
  downloadFile(content, fileName);
};

export const loadNote = async (file: File): Promise<{ pdfBlob: Blob, name: string, annotations: Record<number, DrawingPath[]> }> => {
  const zip = new JSZip();
  const content = await zip.loadAsync(file);
  
  // Check valid .note structure
  if (!content.file("document.pdf") || !content.file("annotations.json")) {
    throw new Error("Formato de arquivo inválido. Arquivo .note corrompido ou incompatível.");
  }

  const pdfBlob = await content.file("document.pdf")!.async("blob");
  const annotationsText = await content.file("annotations.json")!.async("text");
  const annotations = JSON.parse(annotationsText);
  
  // Try to get original name from metadata, fallback to file name
  let name = file.name;
  if (content.file("metadata.json")) {
    try {
        const metaText = await content.file("metadata.json")!.async("text");
        const meta = JSON.parse(metaText);
        if (meta.originalName) name = meta.originalName;
    } catch (e) {
        console.warn("Failed to read metadata", e);
    }
  }

  return { pdfBlob, name, annotations };
};