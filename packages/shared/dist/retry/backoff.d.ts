export type RetryStrategy = "FIXED" | "LINEAR" | "EXPONENTIAL";
export declare function computeBackoffMs(strategy: RetryStrategy, attempt: number, baseDelayMs: number, maxDelayMs: number): number;
