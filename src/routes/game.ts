import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../DB/prisma";
import { authenticate } from "../plugins/authenticate";

export async function routerGame(fastify: FastifyInstance) {
  fastify.get(
    "/pools/:id/games",
    {
      onRequest: [authenticate],
    },
    async (req) => {
      const getPoolParams = z.object({
        id: z.string(),
      });

      const { id } = getPoolParams.parse(req.params);

      const games = await prisma.game.findMany({
        orderBy: {
          date: "desc",
        },

        include: {
          guesses: {
            where: {
              participant: {
                userId: req.user.sub,
                poolId: id,
              },
            },
          },
        },
      });

      return {
        games: games.map((game) => {
          return {
            ...game,
            guess: game.guesses.length > 0 ? game.guesses : null,
            guesses: undefined,
          };
        }),
      };
    }
  );

  fastify.post(
    "/pools/:poolId/games/:gameId/guesses",
    {
      onRequest: [authenticate],
    },
    async (req, res) => {
      const createGuessesParams = z.object({
        poolId: z.string(),
        gameId: z.string(),
      });

      const createGuessBody = z.object({
        firstTeamPoints: z.number(),
        secondTeamPoints: z.number(),
      });

      const { gameId, poolId } = createGuessesParams.parse(req.params);
      const { firstTeamPoints, secondTeamPoints } = createGuessBody.parse(
        req.body
      );

      const participant = await prisma.participant.findUnique({
        where: {
          userId_poolId: {
            poolId,
            userId: req.user.sub,
          },
        },
      });

      if (!participant) {
        return res.status(400).send({
          message: "You're not allowed to create a guess inside this pool.",
        });
      }

      const guess = await prisma.guess.findUnique({
        where: {
          participantId_gameId: {
            participantId: participant.id,
            gameId,
          },
        },
      });

      if (guess) {
        return res.status(400).send({
          message: "you already sent a guess to this game on this pool.",
        });
      }

      const game = await prisma.game.findUnique({
        where: {
          id: gameId,
        },
      });

      if (!game) {
        return res.status(400).send({
          message: "Game not found.",
        });
      }

      if (game.date < new Date()) {
        return res.status(400).send({
          message: "You cannot send guesses after the game date.",
        });
      }

      await prisma.guess.create({
        data: {
          gameId,
          participantId: participant.id,
          firstTeamPoints,
          secondTeamPoints,
        },
      });

      return res.status(201).send();
    }
  );
}
