import { FastifyInstance } from "fastify";
import { prisma } from "../DB/prisma";

export async function routerGuess(fastify: FastifyInstance) {
  fastify.get("/guesses/count", async () => {
    const guesses = await prisma.guess.count();
    return { guesses };
  });
}
