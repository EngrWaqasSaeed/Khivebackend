import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { pointsService } from "../services/points.services";
const prisma = new PrismaClient();

export const projectStatus = async (req: Request, res: Response) => {
  try {
    const { project_status, userId } = req.body;

    const validStatuses = ["EARLY", "ONTIME", "LATE"];

    if (!validStatuses.includes(project_status)) {
      res.status(400).json({ message: "Invalid work status is provided!" });
      return;
    }

    if (!userId) {
      res.status(403).json({ message: "User not authenticated!" });
      return;
    }

    const projectStatus = await prisma.project_Delivery.create({
      data: {
        userId: userId,
        project_status: (project_status as "EARLY") || "ONTIME" || "LATE",
      },
    });

    // check status and update points

    if (project_status === "EARLY") {
      pointsService.changeUserPoints(userId, 200);
    } else if (project_status === "ONTIME") {
      pointsService.changeUserPoints(userId, 100);
    } else if (project_status === "LATE") {
      pointsService.changeUserPoints(userId, -200);
    }

    res.status(201).json({
      message: "Project status added successfully",
      data: projectStatus,
    });
  } catch {
    res
      .status(500)
      .json({ message: "Internal server error in project create controller." });
  }
};

// Get all the project_status @admin access only
export const allProjectRecord = async (req: Request, res: Response) => {
  try {
    const projectStatus = await prisma.project_Delivery.findMany();
    res.status(200).json(projectStatus);
  } catch {
    res
      .status(500)
      .json({ message: "Internal server error in getting project details." });
  }
};

//Get all the project status based on user id @admin access only
export const ProjectById = async (req: Request, res: Response) => {
  try {
    const userId = req.params;
    if (!userId) {
      res.status(403).json({ message: "User Id is required!" });
      return;
    }
    const projectStatus = await prisma.project_Delivery.findMany({
      where: {
        userId: userId,
      },
    });
    res.status(200).json(projectStatus);
  } catch {
    res
      .status(500)
      .json({ message: "Internal server error in Updating project details." });
  }
};

// Update break status by id @admin access only
export const updateProductRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { project_status } = req.body;

    const validStatuses = ["EARLY", "ONTIME", "LATE"];
    if (!validStatuses.includes(project_status)) {
      res.status(400).json({ message: "Invalid project status provided!" });
      return;
    }

    const projectStatus = await prisma.project_Delivery.update({
      where: {
        id: Number(id),
      },
      data: {
        project_status: (project_status as "EARLY") || "ONTIME" || "LATE",
      },
    });
    res.status(200).json({
      message: "Break status updated successfully",
      data: projectStatus,
    });
  } catch {
    res
      .status(500)
      .json({ message: "Internal server error in break update Controller." });
  }
};

//Delete project status by id @admin access only
export const deleteProjectRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const project_status = await prisma.project_Delivery.delete({
      where: {
        id: Number(id),
      },
    });
    res.status(200).json({
      message: "project record  deleted successfully",
      data: project_status,
    });
  } catch {
    res
      .status(500)
      .json({ message: "Internal server error in project delete Controller." });
  }
};
