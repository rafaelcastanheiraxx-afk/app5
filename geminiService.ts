
import { GoogleGenAI } from "@google/genai";
import { HealthEntry } from "../types";

export class GeminiHealthService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async summarizePatterns(entries: HealthEntry[]): Promise<string> {
    const prompt = `
      Você é um assistente de observação de dados de saúde para o app APPG. 
      Sua tarefa é resumir padrões nos dados abaixo de forma ética e descritiva.
      
      REGRAS CRÍTICAS:
      1. NÃO realize diagnósticos.
      2. NÃO prescreva tratamentos ou medicamentos.
      3. Use linguagem observacional (ex: "Nota-se uma tendência de elevação..." em vez de "Você tem pressão alta").
      4. Sempre termine com o aviso: "Este resumo não substitui uma avaliação médica profissional."
      
      DADOS:
      ${JSON.stringify(entries.slice(0, 20))}
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          temperature: 0.7,
          topP: 0.8,
        },
      });
      return response.text || "Não foi possível gerar um resumo no momento.";
    } catch (error) {
      console.error("AI Error:", error);
      return "Erro ao processar insights de IA. Verifique sua conexão.";
    }
  }

  async getBiblicalMessage(): Promise<string> {
    const prompt = "Gere uma breve mensagem bíblica de encorajamento e paz para alguém cuidando da saúde. Em português.";
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text || "Tudo posso naquele que me fortalece.";
    } catch {
      return "O Senhor é o meu pastor, nada me faltará.";
    }
  }
}
