import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const askStudyAssistant = async (question: string): Promise<string> => {
  const client = getClient();
  if (!client) return "Erro: Chave de API não configurada.";

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Você é um assistente de estudos inteligente integrado a um leitor de PDF. 
      O usuário está lendo um documento e tem a seguinte dúvida ou pedido: "${question}".
      Responda de forma concisa, didática e formatada em Markdown. Se for uma pergunta complexa, quebre em tópicos.`,
    });
    
    return response.text || "Não foi possível gerar uma resposta.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Ocorreu um erro ao consultar o assistente inteligente.";
  }
};
