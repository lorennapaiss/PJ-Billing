export interface EmployeeBillingData {
  id: string;
  name: string; // Colaborador
  planType: string; // Tipo do Plano
  monthlyFee: number; // Mensalidade
  copay: number; // Coparticipação
  dependentsCost: number; // Custo Dependentes
  total: number; // Total a descontar
  referenceMonth: string; // Mês de Referência
}

export interface EmailTemplateResponse {
  subject: string;
  body: string;
}
