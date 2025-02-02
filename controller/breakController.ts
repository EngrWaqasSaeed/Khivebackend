import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { pointsService } from "../services/points.services";
const prisma = new PrismaClient();

export const breakStatus = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { breakStatus, userId } = req.body;

    const validStatuses = ["EARLY", "ONTIME", "LATE"];

    if (!validStatuses.includes(breakStatus)) {
      res.status(400).json({ message: "Invalid work status is provided!" });
      return;
    }

    if (!userId) {
      res.status(403).json({ message: "User not authenticated!" });
      return;
    }
    const break_status = await prisma.break.create({
      data: {
        userId: userId,
        break_status: (breakStatus as "EARLY") || "ONTIME" || "LATE",

        date: new Date(),
      },
    });

    // check status and update points
    if (breakStatus === "EARLY") {
      pointsService.changeUserPoints(userId, 100);
    } else if (breakStatus === "ONTIME") {
      pointsService.changeUserPoints(userId, 50);
    } else if (breakStatus === "LATE") {
      pointsService.changeUserPoints(userId, -100);
    }

    res.status(201).json({
      message: "Break status updated successfully",
      data: break_status,
    });
  } catch {
    res
      .status(500)
      .json({ message: "Internal server error in breakController." });
  }
};

// Get all the break status @admin access only
export const allBreakRecord = async (req: Request, res: Response) => {
  try {
    const breakStatus = await prisma.break.findMany();
    res.status(200).json(breakStatus);
  } catch {
    res
      .status(500)
      .json({ message: "Internal server error in breakController." });
  }
};

//Get all the break status based on user id @admin access only
export const breakRecordById = async (req: Request, res: Response) => {
  try {
    const userId = req.params;
    if (!userId) {
      res.status(403).json({ message: "User Id is required!" });
      return;
    }
    const breakStatus = await prisma.break.findMany({
      where: {
        userId: userId,
      },
    });
    res.status(200).json(breakStatus);
  } catch {
    res
      .status(500)
      .json({ message: "Internal server error in breakController." });
  }
};

// Update break status by id @admin access only
export const updateBreakRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { breakStatus } = req.body;

    const validStatuses = ["EARLY", "ONTIME", "LATE"];
    if (!validStatuses.includes(breakStatus)) {
      res.status(400).json({ message: "Invalid work status provided!" });
      return;
    }

    const break_status = await prisma.break.update({
      where: {
        id: Number(id),
      },
      data: {
        break_status: (breakStatus as "EARLY") || "ONTIME" || "LATE",
      },
    });
    res.status(200).json({
      message: "Break status updated successfully",
      data: break_status,
    });
  } catch {
    res
      .status(500)
      .json({ message: "Internal server error in break update Controller." });
  }
};

//Delete break status by id @admin access only
export const deleteBreakRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date } = req.body;

    const break_status = await prisma.break.delete({
      where: {
        id: Number(id),
      },
    });
    res.status(200).json({
      message: "Break status deleted successfully",
      data: break_status,
    });
  } catch {
    res
      .status(500)
      .json({ message: "Internal server error in break delete Controller." });
  }
};
