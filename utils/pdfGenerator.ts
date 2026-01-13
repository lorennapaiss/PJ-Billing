import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { EmployeeBillingData } from '../types';
import { formatCurrency } from './formatters';

export const generatePDF = (data: EmployeeBillingData) => {
  const doc = new jsPDF();

  // Header
  doc.setFillColor(63, 81, 181); // Indigo 500
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text('Demonstrativo de Plano de Saúde', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text('Documento Interno para Conferência de Faturamento PJ', 105, 28, { align: 'center' });

  // Employee Info Section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text(`Colaborador: ${data.name}`, 14, 55);
  doc.text(`Referência: ${data.referenceMonth}`, 14, 62);
  doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 14, 69);

  // Data Table
  const tableBody = [
    ['Descrição', 'Valor'],
    ['Mensalidade do Plano', formatCurrency(data.monthlyFee)],
    ['Custo Dependentes', formatCurrency(data.dependentsCost)],
    ['Coparticipação', formatCurrency(data.copay)],
  ];

  autoTable(doc, {
    startY: 80,
    head: [['Item', 'Detalhe']],
    body: tableBody,
    theme: 'grid',
    headStyles: { fillColor: [63, 81, 181], textColor: 255 },
    styles: { fontSize: 11, cellPadding: 3 },
  });

  // Total Section
  // @ts-ignore
  const finalY = doc.lastAutoTable.finalY + 10;
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total a Descontar: ${formatCurrency(data.total)}`, 14, finalY);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(
    'Por favor, destaque este valor na sua próxima Nota Fiscal como "Reembolso de Despesas" ou deduza do valor bruto, conforme orientação contábil da sua empresa.',
    14,
    finalY + 10,
    { maxWidth: 180 }
  );

  // Footer
  doc.setFontSize(8);
  doc.text('Gerado automaticamente pelo Sistema de Gestão de Benefícios', 105, 280, { align: 'center' });

  doc.save(`Demonstrativo_Saude_${data.name.replace(/\s+/g, '_')}.pdf`);
};
