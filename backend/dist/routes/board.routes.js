"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const board_controller_1 = require("../controllers/board.controller");
const router = (0, express_1.Router)();
// Board Data (Lists & Tasks) for a project
router.get('/:projectId', board_controller_1.getBoardData);
router.put('/:projectId', board_controller_1.updateBoardData);
exports.default = router;
