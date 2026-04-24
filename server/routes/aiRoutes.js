import express from "express"
import { askAI, askAIWithContext } from "../controller/aiController.js"
import { authMiddleware } from "../middleware/authMiddleware.js"

const router = express.Router()

router.post("/ask", authMiddleware, askAI)  // Простой запрос
router.post("/ask-context", authMiddleware, askAIWithContext)  

export default router