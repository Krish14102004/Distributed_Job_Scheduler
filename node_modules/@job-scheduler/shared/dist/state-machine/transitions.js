"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canTransition = canTransition;
exports.assertTransition = assertTransition;
const ALLOWED = {
    QUEUED: ["CLAIMED", "CANCELLED"],
    SCHEDULED: ["QUEUED", "CANCELLED"],
    CLAIMED: ["RUNNING", "QUEUED"],
    RUNNING: ["COMPLETED", "FAILED"],
    FAILED: ["RETRYING", "DEAD_LETTER"],
    RETRYING: ["QUEUED"],
    COMPLETED: [],
    DEAD_LETTER: [],
    CANCELLED: []
};
function canTransition(from, to) {
    return ALLOWED[from]?.includes(to) ?? false;
}
function assertTransition(from, to) {
    if (!canTransition(from, to)) {
        throw new Error(`Illegal job transition: ${from} -> ${to}`);
    }
}
