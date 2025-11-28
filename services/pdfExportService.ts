import { PDFDocument } from 'pdf-lib';
import { PDFFile, DrawingPath, DrawingTool } from '../types';

export const exportPDF = async (file: PDFFile, annotations: Record<number, DrawingPath[]>) => {
  try {
    // 1. Load the existing PDF
    const existingPdfBytes = await file.data.arrayBuffer();
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();

    // 2. Iterate through all pages
    for (let i = 0; i < pages.length; i++) {
      const pageIndex = i; // 0-based index matches our annotation storage
      const pageAnnotations = annotations[pageIndex];

      // If there are annotations on this page
      if (pageAnnotations && pageAnnotations.length > 0) {
        const page = pages[i];
        const { width, height } = page.getSize();

        // 3. Create an offscreen canvas to render annotations
        const canvas = document.createElement('canvas');
        // Use a scale factor for better resolution (Retina-like quality)
        const scale = 2; 
        canvas.width = width * scale;
        canvas.height = height * scale;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        // Scale context to match coordinate system
        ctx.scale(scale, scale);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // 4. Draw paths exactly as they appear on screen
        pageAnnotations.forEach(path => {
           if (path.points.length < 2) return;

           ctx.beginPath();
           // Handle Eraser: 'destination-out' makes pixels transparent
           ctx.globalCompositeOperation = path.type === DrawingTool.ERASER ? 'destination-out' : 'source-over';
           ctx.strokeStyle = path.color;
           ctx.lineWidth = path.width;

           // Map normalized coordinates (0..1) to PDF page dimensions
           ctx.moveTo(path.points[0].x * width, path.points[0].y * height);
           for (let j = 1; j < path.points.length; j++) {
             ctx.lineTo(path.points[j].x * width, path.points[j].y * height);
           }
           ctx.stroke();
        });

        // 5. Convert canvas to PNG image
        const pngUrl = canvas.toDataURL('image/png');
        const pngImageBytes = await fetch(pngUrl).then(res => res.arrayBuffer());

        // 6. Embed the PNG into the PDF
        const pngImage = await pdfDoc.embedPng(pngImageBytes);

        // 7. Draw the image over the existing PDF page
        page.drawImage(pngImage, {
          x: 0,
          y: 0,
          width: width,
          height: height,
        });
      }
    }

    // 8. Save and Download
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    
    const fileName = file.name.replace(/\.pdf$/i, '') + '_editado.pdf';
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error("Failed to export PDF", error);
    alert("Erro ao exportar PDF. Verifique o console para mais detalhes.");
  }
};
