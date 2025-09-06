import { PrismaClient } from "@prisma/client";
import * as env from "dotenv";

env.config();
let prisma = new PrismaClient();

export default prisma;
