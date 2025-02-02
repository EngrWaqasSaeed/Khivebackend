import { assert } from "console";
import { prismaClient } from "../utils/prismaClient";
import { User } from "@prisma/client";

export const pointsService = {
  changeUserPoints: async (userId: number, points: number): Promise<User> => {
    assert(userId, "userId is required");
    assert(points, "points is required");

    const user = await prismaClient.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const updatedUser = await prismaClient.user.update({
      where: {
        id: userId,
      },
      data: {
        points: user.points + points,
      },
    });

    return updatedUser;
  },
};
