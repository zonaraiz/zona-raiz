// ==========================================
// CLI Script - Genera archivo seed.sql
// ==========================================

import * as fs from "fs";
import * as path from "path";
import { generateAllSQL } from "./lib/sql-generator";
import { SeedLogger } from "./lib/logger";
import { DEFAULT_SEED_OPTIONS } from "./types";

interface CLIOptions {
  truncate: boolean;
  output: string;
  dryRun: boolean;
  help: boolean;
}

function parseArgs(args: string[]): CLIOptions {
  const options: CLIOptions = {
    truncate: false,
    output: "supabase/seed.sql",
    dryRun: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "--truncate":
      case "-t":
        options.truncate = true;
        break;
      case "--output":
      case "-o":
        options.output = args[++i] || "supabase/seed.sql";
        break;
      case "--dry-run":
      case "-d":
        options.dryRun = true;
        break;
      case "--help":
      case "-h":
        options.help = true;
        break;
      default:
        // Ignorar argumentos desconocidos
        break;
    }
  }

  return options;
}

function printHelp() {
  console.log(`
🎲 Seed SQL Generator

Usage: bun seed:sql [options]

Options:
  --truncate, -t     Incluir TRUNCATE al inicio del SQL (para datos limpios)
  --output, -o       Nombre del archivo de salida (default: seed.sql)
  --dry-run, -d      Mostrar SQL en consola sin escribir archivo
  --help, -h         Mostrar esta ayuda

Examples:
  bun seed:sql                    # Generar seed.sql sin TRUNCATE
  bun seed:sql --truncate        # Generar con TRUNCATE
  bun seed:sql -o custom.sql     # Guardar en custom.sql
  bun seed:sql --dry-run          # Ver SQL en consola
`);
}

async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (options.help) {
    printHelp();
    return;
  }

  SeedLogger.section("🎲 Seed SQL Generator");

  try {
    // Generar SQL
    const sql = generateAllSQL(DEFAULT_SEED_OPTIONS, options.truncate);

    if (options.dryRun) {
      // Modo dry-run: mostrar en consola
      SeedLogger.info("Modo dry-run - SQL generado:");
      console.log("\n" + sql);
    } else {
      // Escribir archivo
      const outputPath = path.resolve(process.cwd(), options.output);
      fs.writeFileSync(outputPath, sql, "utf-8");
      SeedLogger.success(`✅ SQL guardado en: ${outputPath}`);

      // Info de uso
      console.log("\n📝 Para ejecutar en Supabase:");
      console.log(
        `   psql -h <host> -U <user> -d <database> -f ${options.output}`,
      );
      console.log("   o copiar y pegar en el SQL Editor de Supabase");
    }

    process.exit(0);
  } catch (error) {
    SeedLogger.error("❌ Error al generar SQL:");
    console.error(error);
    process.exit(1);
  }
}

main();
