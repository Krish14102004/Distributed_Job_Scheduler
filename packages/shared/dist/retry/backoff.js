"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeBackoffMs = computeBackoffMs;
function computeBackoffMs(strategy, attempt, baseDelayMs, maxDelayMs) {
    let delay;
    switch (strategy) {
        case "FIXED":
            delay = baseDelayMs;
            break;
        case "LINEAR":
            delay = baseDelayMs * attempt;
            break;
        case "EXPONENTIAL":
            delay = baseDelayMs * Math.pow(2, attempt - 1);
            break;
        default:
            delay = baseDelayMs;
    }
    return Math.min(delay, maxDelayMs);
}
