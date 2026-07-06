import { Router } from "express";
import { authenticate } from "@/middlewares/authenticate.js";
import { imageUpload } from "@/middlewares/upload.js";
import * as upload from "@/controllers/upload.controller.js";

export const uploadRoutes = Router();

uploadRoutes.post("/image", authenticate, imageUpload.single("image"), upload.uploadImage);
