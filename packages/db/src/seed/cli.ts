import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateSeedSQL } from "./generate-seed.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const sql = generateSeedSQL(500);
const targetPath = path.resolve(__dirname, "../../../../supabase/seed.sql");
fs.writeFileSync(targetPath, sql, "utf-8");
console.info(`Generated 500-product seed file at: ${targetPath}`);
