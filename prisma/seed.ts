import { prisma } from "../src/DB/prisma";

async function main() {
  const user = await prisma.user.create({
    data: {
      name: "Matheus",
      email: "matheus@gmail.com",
      avatarUrl: "https://github.com/serafimmatheus.png",
    },
  });

  const pool = await prisma.pool.create({
    data: {
      title: "Bolão do Serafim",
      code: "BOL123",
      ownerId: user.id,

      participants: {
        create: {
          userId: user.id,
        },
      },
    },
  });

  await prisma.game.create({
    data: {
      date: "2023-01-25T02:52:22.071Z",
      firstTeamCountryCode: "DE",
      secondTeamCountryCode: "BR",
    },
  });

  await prisma.game.create({
    data: {
      date: "2023-01-21T02:52:22.071Z",
      firstTeamCountryCode: "BR",
      secondTeamCountryCode: "AR",

      guesses: {
        create: {
          firstTeamPoints: 2,
          secondTeamPoints: 1,
          participant: {
            connect: {
              userId_poolId: {
                poolId: pool.id,
                userId: user.id,
              },
            },
          },
        },
      },
    },
  });
}

main();
