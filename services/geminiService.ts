import { GoogleGenAI, Type } from "@google/genai";
import { EmployeeBillingData, EmailTemplateResponse } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey });

export const generateEmailTemplate = async (
  employeeData: EmployeeBillingData
): Promise<EmailTemplateResponse> => {
  
  const prompt = `
    Você é um assistente de RH. Escreva um e-mail formal, porém amigável, para o colaborador PJ chamado "${employeeData.name}".
    
    O objetivo é informar sobre o desconto do plano de saúde na próxima nota fiscal.
    
    Detalhes:
    - Mês de referência: ${employeeData.referenceMonth}
    - Valor total a ser descontado: R$ ${employeeData.total.toFixed(2)}
    - Motivo: Custos de mensalidade e coparticipação do plano de saúde.
    
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
      subject: "Aviso de Débito - Plano de Saúde",
      body: `Olá ${employeeData.name},\n\nInformamos que o valor de R$ ${employeeData.total.toFixed(2)} referente ao plano de saúde (${employeeData.referenceMonth}) deve ser descontado na sua próxima nota fiscal.\n\nAtenciosamente,\nFinanceiro/RH`
    };
  }
};
