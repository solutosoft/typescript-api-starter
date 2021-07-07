import { program } from "@caporal/core";
import { loadEnv } from "./global";
import { migrate } from "./commands/migrate";

loadEnv();

program
  .command("migrate", "Migrate database")
  .action(migrate);

program.run();
