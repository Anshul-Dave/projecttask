"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const init_controller_1 = require("../controllers/init.controller");
const router = (0, express_1.Router)();
router.get('/', init_controller_1.initDatabase);
exports.default = router;
