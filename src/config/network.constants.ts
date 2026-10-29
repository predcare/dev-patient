/** How often the connection is re-evaluated. */
export const CONNECTION_CHECK_MS = 5000;

/** The latency probe runs every Nth check (every 15 s) to keep traffic small. */
export const CONNECTION_PROBE_EVERY = 3;

/** A probe slower than this (or failing) counts as a bad reading. */
export const CONNECTION_SLOW_MS = 2000;
export const CONNECTION_PROBE_TIMEOUT_MS = 5000;

/** Consecutive readings needed to show / hide the unstable banner, so it does not flicker. */
export const CONNECTION_UNSTABLE_AFTER = 2;
export const CONNECTION_STABLE_AFTER = 2;
