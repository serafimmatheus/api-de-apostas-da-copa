import { FastifyInstance } from "fastify";
import ShortUniqueId from "short-unique-id";
import { z } from "zod";
import { prisma } from "../DB/prisma";
import { authenticate } from "../plugins/authenticate";

export async function routerPool(fastify: FastifyInstance) {
  fastify.get("/pools/count", async () => {
    const pools = await prisma.pool.count();
    return { pools };
  });

  fastify.post("/pools", async (req, res) => {
    const createPoolsZod = z.object({
      title: z.string(),
    });

    const { title } = createPoolsZod.parse(req.body);

    const generateCodeId = new ShortUniqueId({ length: 6 });
    const code = String(generateCodeId()).toUpperCase();

    try {
      await req.jwtVerify();

      await prisma.pool.create({
        data: {
          title,
          code,
          ownerId: req.user.sub,

          participants: {
            create: {
              userId: req.user.sub,
            },
          },
        },
      });
    } catch {
      await prisma.pool.create({
        data: {
          title,
          code,
        },
      });
    }

    res.status(201).send({ code });
  });

  fastify.post(
    "/pool/join",
    {
      onRequest: [authenticate],
    },
    async (req, res) => {
      const joinPoolBody = z.object({
        code: z.string(),
      });

      const { code } = joinPoolBody.parse(req.body);

      const pool = await prisma.pool.findUnique({
        where: {
          code,
        },
        include: {
          participants: {
            where: {
              userId: req.user.sub,
            },
          },
        },
      });

      if (!pool) {
        return res.status(400).send({
          message: "Pool not found",
        });
      }

      if (pool.participants.length > 0) {
        return res.status(400).send({
          message: "You already joined this pool",
        });
      }

      if (!pool.ownerId) {
        await prisma.pool.update({
          where: {
            id: pool.id,
          },
          data: {
            ownerId: req.user.sub,
          },
        });
      }

      await prisma.participant.create({
        data: {
          poolId: pool.id,
          userId: req.user.sub,
        },
      });

      return res.status(201).send();
    }
  );

  fastify.get(
    "/pools",
    {
      onRequest: [authenticate],
    },
    async (req, res) => {
      const pools = await prisma.pool.findMany({
        where: {
          participants: {
            some: {
              userId: req.user.sub,
            },
          },
        },

        include: {
          _count: {
            select: {
              participants: true,
            },
          },

          participants: {
            take: 4,
            select: {
              id: true,

              user: {
                select: {
                  avatarUrl: true,
                },
              },
            },
          },
          owner: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return { pools };
    }
  );

  fastify.get(
    "/pools/:id",
    {
      onRequest: [authenticate],
    },
    async (req) => {
      const getPoolsParams = z.object({
        id: z.string(),
      });

      const { id } = getPoolsParams.parse(req.params);

      const pools = await prisma.pool.findUnique({
        where: {
          id,
        },

        include: {
          _count: {
            select: {
              participants: true,
            },
          },

          participants: {
            take: 4,
            select: {
              id: true,

              user: {
                select: {
                  avatarUrl: true,
                },
              },
            },
          },
          owner: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return { pools };
    }
  );
}
