import { categorizarDespesa } from "@/deepseek/deepseek-api"
import { database } from "@/infra/database"
import { PrismaClient } from "@prisma/client"

interface DatabseVersionResult {
  server_version: string
}

interface MaxConnectionsResult {
  max_connections: string
}

interface CountResult {
  count: number
}

export async function GET(req: Request, res) {
  console.log("req here", req.body)
  console.log("res here", res)
  const databaseVersion = await database.$queryRaw<
    DatabseVersionResult[]
  >`SHOW server_version`
  const updatedAt = new Date().toISOString()

  const databaseMaxConnections = await database.$queryRaw<
    MaxConnectionsResult[]
  >`SHOW max_connections`

  const databaseName = process.env.POSTGRES_DB

  const databaseOpenedConnectionsResult = await database.$queryRaw<
    CountResult[]
  >`
  SELECT count(*)::int as count
  FROM pg_stat_activity
  WHERE datname = ${databaseName};
`

  return new Response(
    JSON.stringify({
      updated_at: updatedAt,
      dependencies: {
        database: {
          version: databaseVersion[0].server_version,
          max_connections: Number(databaseMaxConnections[0].max_connections),
          opened_connections: databaseOpenedConnectionsResult[0].count,
        },
      },
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    },
  )
}

export async function POST(req: Request, res) {
  const formData = await req.formData()
  const messageSid = formData.get("MessageSid")
  const from: any = formData.get("From")
  const to = formData.get("To")
  const bodyValue = formData.get("Body")

  const prisma = new PrismaClient()

  let body = ""
  if (typeof bodyValue === "string") {
    body = bodyValue
  } else if (bodyValue instanceof File) {
    body = await bodyValue.text()
  }

  if (body) {
    const despeza = await categorizarDespesa(body)

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

    const transaction = await prisma.transaction.create({
      data: {
        description: despeza.descricao,
        amount: despeza.valor,
        originalMessage: despeza.originalMessage,
        userId: user.id,
        categoryId: category.id,
      },
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
