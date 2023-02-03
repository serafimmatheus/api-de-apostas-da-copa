import { FastifyInstance } from "fastify";
import { prisma } from "../DB/prisma";

export async function routerUser(fastify: FastifyInstance) {
  fastify.get("/users/count", async () => {
    const users = await prisma.user.count();
    return { users };
  });
}
