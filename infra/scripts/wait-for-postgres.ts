import { exec } from "node:child_process"

async function checkPostgres(): Promise<void> {
  exec("docker exec postgres-dev pg_isready --host localhost", handleReturn)

  function handleReturn(error: Error | null, stdout: string): void {
    if (stdout.search("accepting connections") === -1) {
      process.stdout.write(".")
      setTimeout(checkPostgres, 1500)
      return
    }
    console.log("\nPostgres está pronto e aceitando conexões!\n")
  }
}

process.stdout.write("\n\nAguardando Postgres aceitar conexões...")
checkPostgres()
