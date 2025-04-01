// npm install openai
import OpenAI from "openai"

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
})

type CategorizarDespesaResponse = {
  categoria: string
  descricao: string
  valor: number
  originalMessage: string
}

export async function categorizarDespesa(
  originalMessage: string,
): Promise<CategorizarDespesaResponse> {
  console.log("originalMessage", originalMessage)
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `
        Você é uma IA que classifica despesas informadas pelo usuário.
        Para cada mensagem do usuário, identifique:
        - a categoria da despesa (ex: alimento, transporte, entretenimento, moradia, outros)
        - a descrição curta do item
        - o valor gasto (em reais)

        Sempre retorne a resposta no seguinte formato JSON:
        {
          "categoria": "...",
          "descricao": "...",
          "valor": ...
        }
        `,
      },
      { role: "user", content: String(originalMessage) },
    ],
    model: "deepseek-chat",
  })

  const respostaIA = completion.choices[0].message.content

  const jsonData = JSON.parse(respostaIA.replace(/```json|```/g, "").trim())

  console.log("respostaIA", respostaIA)

  console.log("respostaIA", jsonData)

  try {
    return { ...jsonData, originalMessage }
  } catch (e) {
    console.error("Resposta inválida da IA:", respostaIA)
    throw e
  }
}
