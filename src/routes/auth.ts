import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../DB/prisma";
import { authenticate } from "../plugins/authenticate";

export async function routerAuth(fastify: FastifyInstance) {
  fastify.get(
    "/me",
    {
      onRequest: [authenticate],
    },
    async (req) => {
      return { user: req.user };
    }
  );

  fastify.post("/users", async (req, res) => {
    const createuser = z.object({
      access_token: z.string(),
    });

    const { access_token } = createuser.parse(req.body);

    const userResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const userDate = await userResponse.json();

    const userInfoSchema = z.object({
      id: z.string(),
      email: z.string().email(),
      name: z.string(),
      picture: z.string().url(),
    });

    const userInfo = userInfoSchema.parse(userDate);

    let user = await prisma.user.findUnique({
      where: {
        googleId: userInfo.id,
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          googleId: userInfo.id,
          name: userInfo.name,
          email: userInfo.email,
          avatarUrl: userInfo.picture,
        },
      });
    }

    const token = fastify.jwt.sign(
      {
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      { sub: user.id, expiresIn: "1d" }
    );

    return { token };
  });
}
