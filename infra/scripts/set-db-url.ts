/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs")
const dbUrl = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}?schema=public`

fs.writeFileSync(".env", `DATABASE_URL="${dbUrl}"`)
