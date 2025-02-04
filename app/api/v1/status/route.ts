import { database } from "@/infra/database"
import { NextApiResponse } from "next"

interface DatabseVersionResult {
  server_version: string
}

interface MaxConnectionsResult {
  max_connections: string
}

interface CountResult {
  count: number
}

export async function GET(request: NextApiResponse, response: NextApiResponse) {
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
