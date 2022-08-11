// Vector's equalsEpsilon has a bug: the epsilon argument is ignored for X axis

/**
 * Compares both vectors for epsilon equality
 * @param {Function} _
 * @param {[import("core/vector").Vector, number]} args
 * @this {import("core/vector").Vector}
 */
export function equalsEpsilon(_, [v, epsilon = 1e-5]) {
    return Math.abs(this.x - v.x) < epsilon && Math.abs(this.y - v.y) < epsilon;
}
