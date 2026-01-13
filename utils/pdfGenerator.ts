import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { EmployeeBillingData } from '../types';
import { formatCurrency } from './formatters';

export const generatePDF = (data: EmployeeBillingData) => {
  const doc = new jsPDF();
  
  // --- Branding Colors (Raiz Educação Style) ---
  const RAIZ_ORANGE = [243, 112, 33] as [number, number, number]; // #F37021
  const RAIZ_GREY = [60, 60, 59] as [number, number, number];    // #3C3C3B
  const LIGHT_GREY = [240, 240, 240] as [number, number, number];

  // --- Header ---
  // Top Orange Bar
  doc.setFillColor(...RAIZ_ORANGE);
  doc.rect(0, 0, 210, 5, 'F');

  // Logo Placeholder
  doc.setTextColor(...RAIZ_ORANGE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("raiz", 14, 25);
  doc.setTextColor(...RAIZ_GREY);
  doc.text("educação", 35, 25); 
  
  // Title
  doc.setFontSize(16);
  doc.setTextColor(...RAIZ_GREY);
  doc.text('Demonstrativo de Benefícios', 200, 25, { align: 'right' });
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Conferência Mensal de Faturamento PJ', 200, 31, { align: 'right' });

  // Divider
  doc.setDrawColor(220, 220, 220);
  doc.line(14, 35, 196, 35);

  // --- Employee Info Box ---
  // Increased height slightly to accommodate extra line if needed
  doc.setFillColor(...LIGHT_GREY);
  doc.rect(14, 45, 182, 40, 'F'); 
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("DADOS DO COLABORADOR", 20, 55);
  
  // Column 1
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Nome:`, 20, 63);
  doc.setFont("helvetica", "bold");
  doc.text(`${data.name}`, 35, 63);
  
  doc.setFont("helvetica", "normal");
  doc.text(`Referência:`, 20, 70);
  doc.setFont("helvetica", "bold");
  doc.text(`${data.referenceMonth}`, 45, 70);

  doc.setFont("helvetica", "normal");
  doc.text(`Emissão:`, 20, 77);
  doc.setFont("helvetica", "bold");
  doc.text(`${new Date().toLocaleDateString('pt-BR')}`, 45, 77);

  // Column 2
  doc.setFont("helvetica", "normal");
  doc.text(`Plano Saúde:`, 110, 63);
  doc.setFont("helvetica", "bold");
  doc.text(`${data.healthPlanType}`, 135, 63);

  doc.setFont("helvetica", "normal");
  doc.text(`Plano Odonto:`, 110, 70);
  doc.setFont("helvetica", "bold");
  doc.text(`${data.dentalPlanType}`, 135, 70);

  // --- Data Table ---
  const tableBody = [
    [`Mensalidade Plano de Saúde (${data.healthPlanType})`, formatCurrency(data.monthlyFee)],
    [`Mensalidade Plano Odontológico (${data.dentalPlanType})`, formatCurrency(data.dentalCost)],
    ['Custo Dependentes (Saúde/Odonto)', formatCurrency(data.dependentsCost)],
    ['Coparticipação (Consultas/Exames)', formatCurrency(data.copay)],
  ];

  autoTable(doc, {
    startY: 95,
    head: [['Descrição do Lançamento', 'Valor (R$)']],
    body: tableBody,
    theme: 'plain',
    headStyles: { 
      fillColor: RAIZ_GREY, 
      textColor: 255, 
      fontStyle: 'bold',
      halign: 'left'
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 50, halign: 'right' }
    },
    styles: { 
      fontSize: 11, 
      cellPadding: 6,
      lineColor: [230, 230, 230],
      lineWidth: { bottom: 0.5 }
    },
    alternateRowStyles: {
      fillColor: [252, 252, 252]
    }
  });

  // --- Total Section ---
  // @ts-ignore
  const finalY = doc.lastAutoTable.finalY + 15;
  
  // Total Box
  doc.setFillColor(...RAIZ_ORANGE);
  doc.rect(120, finalY, 76, 12, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text('TOTAL A DESCONTAR', 125, finalY + 8);
  doc.text(formatCurrency(data.total), 192, finalY + 8, { align: 'right' });

  // --- Footer / Disclaimer ---
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  
  const disclaimerY = finalY + 40;
  doc.text(
    'Importante: O valor total acima deverá ser abatido na emissão da sua Nota Fiscal de Serviços.',
    14,
    disclaimerY
  );
  doc.text(
    'Em caso de dúvidas sobre os valores, entre em contato com o time de Pessoas & Cultura.',
    14,
    disclaimerY + 5
  );

  // Bottom Line
  doc.setDrawColor(...RAIZ_ORANGE);
  doc.setLineWidth(1);
  doc.line(14, 280, 196, 280);
  
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Raiz Educação - Gestão de Benefícios', 14, 285);
  doc.text('Documento gerado eletronicamente', 196, 285, { align: 'right' });

  doc.save(`Demostrativo_Raiz_${data.name.replace(/\s+/g, '_')}.pdf`);
};