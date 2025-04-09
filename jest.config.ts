import dotenv from "dotenv"
import type { Config } from "jest"
import nextJest from "next/jest"

dotenv.config({
  path: ".env.development",
})

const createJestConfig = nextJest({
  dir: ".",
})

const customJestConfig: Config = {
  moduleDirectories: ["node_modules", "<rootDir>"],
  testTimeout: 60000,
}

export default createJestConfig(customJestConfig)
