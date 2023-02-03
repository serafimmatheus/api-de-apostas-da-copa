import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { routerPool } from "./routes/pool";
import { routerUser } from "./routes/user";
import { routerGuess } from "./routes/guess";
import { routerGame } from "./routes/game";
import { routerAuth } from "./routes/auth";
import * as dotenv from "dotenv";

dotenv.config();

async function bootstrap() {
  const fastify = Fastify({
    logger: true,
  });

  await fastify.register(cors, {
    origin: true,
  });

  await fastify.register(jwt, {
    secret: `${process.env.SECRET_KEY}`,
  });

  await fastify.register(routerPool);
  await fastify.register(routerUser);
  await fastify.register(routerGuess);
  await fastify.register(routerGame);
  await fastify.register(routerAuth);

  await fastify.listen({
    port: 3333,
    // host: "0.0.0.0",
  });
}

bootstrap();
