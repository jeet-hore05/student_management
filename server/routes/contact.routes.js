import { Router } from "express";
import { sendContactMessage } from "../controllers/contact.controller.js";

const router = Router();

router.post("/send", sendContactMessage);

export default router;