import * as XLSX from 'xlsx';
import { EmployeeBillingData } from '../types';
import { parseCurrency } from './formatters';

export const parseExcelFile = (file: File): Promise<EmployeeBillingData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON with header row assumption
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const parsedData: EmployeeBillingData[] = [];
        
        // Iterate starting from row 1 (skipping header)
        for (let i = 1; i < jsonData.length; i++) {
          const row: any = jsonData[i];
          if (!row || row.length === 0) continue;

          // Mapping logic:
          // 0: Name
          // 1: Health Plan Type
          // 2: Health Fee
          // 3: Dep
          // 4: Copay
          // 5: Month
          // 6: Dental Fee
          // 7: Dental Plan Type (New)
          const name = row[0];
          if (!name) continue;

          const monthlyFee = parseCurrency(row[2]);
          const dependentsCost = parseCurrency(row[3]);
          const copay = parseCurrency(row[4]);
          const dentalCost = parseCurrency(row[6]); 
          
          parsedData.push({
            id: `emp-${i}`,
            name: String(name),
            healthPlanType: String(row[1] || 'Padrão'),
            dentalPlanType: String(row[7] || 'Básico'), // Default if missing
            monthlyFee,
            dentalCost,
            dependentsCost,
            copay,
            total: monthlyFee + dependentsCost + copay + dentalCost,
            referenceMonth: String(row[5] || 'Mês Atual')
          });
        }

        resolve(parsedData);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
};

export const downloadExcelTemplate = () => {
  const headers = [
    "Nome do Colaborador", 
    "Plano Saúde (Tipo)", 
    "Mensalidade Saúde (R$)", 
    "Custo Dependentes (R$)", 
    "Coparticipação (R$)", 
    "Mês Referência",
    "Plano Odonto (Valor R$)",
    "Plano Odonto (Tipo)"
  ];
  
  const exampleRow = [
    "João da Silva", 
    "Ouro Apartamento", 
    "450,00", 
    "120,50", 
    "35,00", 
    "Junho/2024",
    "29,90",
    "Odonto Plus"
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
  
  // Set column widths for better readability
  const wscols = [
    {wch: 25}, // Name
    {wch: 20}, // Health Plan
    {wch: 18}, // Health Fee
    {wch: 20}, // Dependents
    {wch: 15}, // Copay
    {wch: 15}, // Month
    {wch: 18}, // Dental Fee
    {wch: 20}  // Dental Plan
  ];
  ws['!cols'] = wscols;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Modelo Importação");
  
  XLSX.writeFile(wb, "Modelo_Faturamento_PJ_Raiz.xlsx");
};