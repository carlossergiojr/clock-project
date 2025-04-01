import { database } from "@/infra/database"

interface DatabseVersionResult {
  server_version: string
}

interface MaxConnectionsResult {
  max_connections: string
}

interface CountResult {
  count: number
}

export async function GET(req: Request) {
  console.log("req here", req.body)
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

export async function POST(req: Request) {
  console.log("req here", req.body)
  console.log("res here", req)

  const formData = await req.formData()
  console.log("formData here", formData)
  const messageSid = formData.get("MessageSid")
  const from = formData.get("From")
  const to = formData.get("To")
  const body = formData.get("Body")

  console.log("MessageSid:", messageSid)
  console.log("From:", from)
  console.log("To:", to)
  console.log("Message Body:", body)

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
