import { GoogleGenAI, Type } from "@google/genai";
import { EmployeeBillingData, EmailTemplateResponse } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey });

export const generateEmailTemplate = async (
  employeeData: EmployeeBillingData
): Promise<EmailTemplateResponse> => {
  
  const prompt = `
    Você é um assistente de RH da empresa Raiz Educação. Escreva um e-mail formal, porém amigável, para o colaborador PJ chamado "${employeeData.name}".
    
    O objetivo é informar sobre o desconto dos benefícios na próxima nota fiscal.
    
    Detalhes do Desconto:
    - Mês de referência: ${employeeData.referenceMonth}
    - Total Geral a descontar: R$ ${employeeData.total.toFixed(2)}
    
    Discriminação dos valores:
    - Plano de Saúde (${employeeData.healthPlanType}): R$ ${employeeData.monthlyFee.toFixed(2)}
    - Plano Odontológico (${employeeData.dentalPlanType}): R$ ${employeeData.dentalCost.toFixed(2)}
    - Dependentes: R$ ${employeeData.dependentsCost.toFixed(2)}
    - Coparticipação: R$ ${employeeData.copay.toFixed(2)}
    
    Por favor, mencione que o demonstrativo detalhado em PDF segue em anexo (contexto hipotético).
    
    Retorne a resposta estritamente em JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            body: { type: Type.STRING }
          },
          required: ["subject", "body"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as EmailTemplateResponse;

  } catch (error) {
    console.error("Error generating email:", error);
    return {
      subject: "Aviso de Débito - Benefícios",
      body: `Olá ${employeeData.name},\n\nInformamos que o valor de R$ ${employeeData.total.toFixed(2)} referente ao plano de saúde e odontológico (${employeeData.referenceMonth}) deve ser descontado na sua próxima nota fiscal.\n\nAtenciosamente,\nPeople & Culture`
    };
  }
};