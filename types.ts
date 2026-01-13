export interface EmployeeBillingData {
  id: string;
  name: string; // Colaborador
  healthPlanType: string; // Tipo do Plano de Saúde
  dentalPlanType: string; // Tipo do Plano Odontológico
  monthlyFee: number; // Mensalidade Saúde
  dentalCost: number; // Mensalidade Odonto
  copay: number; // Coparticipação
  dependentsCost: number; // Custo Dependentes
  total: number; // Total a descontar
  referenceMonth: string; // Mês de Referência
}

export interface EmailTemplateResponse {
  subject: string;
  body: string;
}