/* eslint-disable @typescript-eslint/no-explicit-any */
import { categorizarDespesa } from "@/deepseek/deepseek-api"
import { PrismaClient } from "@prisma/client"
import twilio from "twilio"

export async function POST(req: Request) {
  const accountSid = process.env.ACCOUNTSID
  const authToken = process.env.AUTHTOKEN

  const client = twilio(accountSid, authToken)
  const formData = await req.formData()
  // const messageSid = formData.get("MessageSid")
  const from: any = formData.get("From")
  // const to = formData.get("To")
  const bodyValue = formData.get("Body")

  const prisma = new PrismaClient()

  let body = ""
  if (typeof bodyValue === "string") {
    body = bodyValue
  } else if (bodyValue instanceof File) {
    body = await bodyValue.text()
  }

  if (body === "saldo") {
    const user = await prisma.user.findFirst({
      where: {
        phoneNumber: from,
      },
      include: {
        Categories: {},
      },
    })

    if (!user) {
      client.messages.create({
        from: "whatsapp:+14155238886",
        to: from as string,
        body: `Você não possui nenhuma despesa cadastrada`,
      })
    } else {
      const transactions = await prisma.transaction.findMany({
        where: {
          userId: user.id,
        },
      })

      let total = 0

      transactions.forEach((transaction) => {
        total += transaction.amount
      })

      client.messages.create({
        from: "whatsapp:+14155238886",
        to: from as string,
        body: `Seu saldo atual é de R$ -${total}`,
      })

      return new Response(
        JSON.stringify({
          message: "top",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }
  }

  if (body) {
    const despeza = await categorizarDespesa(body)

    if (despeza.valor === 0) {
      client.messages.create({
        from: "whatsapp:+14155238886",
        to: from as string,
        body: "Digite saldo para verificar o saldo atual",
      })

      return new Response(
        JSON.stringify({
          message: "top",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    let user = await prisma.user.findFirst({
      where: {
        phoneNumber: from,
      },
      include: {
        Categories: {},
      },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          phoneNumber: from,
        },
        include: {
          Categories: {},
        },
      })
    }

    let category = await prisma.category.findFirst({
      where: {
        name: despeza.categoria,
        userId: user.id,
      },
    })

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: despeza.categoria,
          userId: user.id,
        },
      })
    }

    await prisma.transaction.create({
      data: {
        description: despeza.descricao,
        amount: despeza.valor,
        originalMessage: despeza.originalMessage,
        userId: user.id,
        categoryId: category.id,
      },
    })

    client.messages.create({
      from: "whatsapp:+14155238886",
      to: from as string,
      body: `Adicionado ${despeza.descricao} | R$:${despeza.valor}`,
    })
  }

  return new Response(
    JSON.stringify({
      message: "top",
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    },
  )
}
