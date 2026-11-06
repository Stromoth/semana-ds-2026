
const express = require("express");
const libraryController = require("../controllers/library.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", libraryController.adicionar);
router.get("/", libraryController.listar);
router.patch("/:id/status", libraryController.atualizarStatus);
router.delete("/:id", libraryController.remover);

module.exports = router;
