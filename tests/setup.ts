import { loadEnv } from "../src/global";
import { setConnectionOptions } from "typeorm-seeding";
import { getDatabaseOptions } from "../src/database";

loadEnv();

const options = getDatabaseOptions();
setConnectionOptions(options);
