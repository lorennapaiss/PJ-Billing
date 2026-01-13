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
        
        // We assume a specific structure or try to map roughly by index for this demo
        // Expected Columns (example): Name, Plan Type, Monthly Fee, Dep Cost, Copay, Month
        // Skip header row [0]
        
        const parsedData: EmployeeBillingData[] = [];
        
        // Simple heuristic: Iterate starting from row 1
        for (let i = 1; i < jsonData.length; i++) {
          const row: any = jsonData[i];
          if (!row || row.length === 0) continue;

          // Mapping logic (Customize based on real excel structure)
          // 0: Name, 1: Plan, 2: Fee, 3: Dep, 4: Copay, 5: Month
          const name = row[0];
          if (!name) continue;

          const monthlyFee = parseCurrency(row[2]);
          const dependentsCost = parseCurrency(row[3]);
          const copay = parseCurrency(row[4]);
          
          parsedData.push({
            id: `emp-${i}`,
            name: String(name),
            planType: String(row[1] || 'Padrão'),
            monthlyFee,
            dependentsCost,
            copay,
            total: monthlyFee + dependentsCost + copay,
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
    "Tipo do Plano", 
    "Mensalidade (R$)", 
    "Custo Dependentes (R$)", 
    "Coparticipação (R$)", 
    "Mês Referência"
  ];
  
  const exampleRow = [
    "João da Silva", 
    "Plano Ouro", 
    "450,00", 
    "120,50", 
    "35,00", 
    "Junho/2024"
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
  
  // Set column widths for better readability
  const wscols = [
    {wch: 25}, // Name
    {wch: 15}, // Plan
    {wch: 15}, // Fee
    {wch: 20}, // Dependents
    {wch: 15}, // Copay
    {wch: 15}  // Month
  ];
  ws['!cols'] = wscols;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Modelo Importação");
  
  XLSX.writeFile(wb, "Modelo_Faturamento_PJ.xlsx");
};
