"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const member_controller_1 = require("../controllers/member.controller");
const router = (0, express_1.Router)();
router.get('/:projectId', member_controller_1.getMembers);
router.post('/:projectId', member_controller_1.addMember);
router.delete('/:projectId/:email', member_controller_1.removeMember);
exports.default = router;
