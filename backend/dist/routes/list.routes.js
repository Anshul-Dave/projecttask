"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const board_controller_1 = require("../controllers/board.controller");
const router = (0, express_1.Router)();
router.post('/', board_controller_1.createList);
router.put('/:id', board_controller_1.updateList);
router.delete('/:id', board_controller_1.deleteList);
exports.default = router;
