import { database } from "@/infra/database"
import retry from "async-retry"

async function clearDatabase() {
  await database.$queryRawUnsafe(
    "drop schema public cascade; create schema public",
  )
}

async function waitForAllServices() {
  await waitForWebServer()

  async function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 5000,
    })

    async function fetchStatusPage() {
      const response = await fetch("http://localhost:3000/api/v1/status")

      if (response.status !== 200) {
        throw new Error()
      }
    }
  }
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
}

export default orchestrator
