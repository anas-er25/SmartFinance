import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const generatePdfReport = async (elementId: string, fileName: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    // 1. Capture the element as a canvas (renders Arabic correctly)
    const canvas = await html2canvas(element, {
      scale: 2, // Improve quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    // 2. Initialize PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // 3. Calculate dimensions to fit A4
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    // Calculate aspect ratio
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 10; // Top padding

    // 4. Add image to PDF. 
    // We adjust the width to match PDF width (minus margins)
    const finalWidth = pdfWidth - 20; 
    const finalHeight = (imgHeight * finalWidth) / imgWidth;

    pdf.addImage(imgData, 'PNG', 10, imgY, finalWidth, finalHeight);
    pdf.save(`${fileName}.pdf`);

  } catch (error) {
    console.error("PDF Generation failed", error);
    alert("Could not generate PDF. Please try again.");
  }
};
