
/**
 * @export
 * @param {Number} value 
 * @param {Number} low1 
 * @param {Number} high1 
 * @param {Number} low2 
 * @param {Number} high2 
 * @returns 
 */
export function remap(value, low1, high1, low2, high2) {
  return low2 + (high2 - low2) * (value - low1) / (high1 - low1)
}

/**
 * @export
 * @param {Number} value 
 * @param {Number} low1 
 * @param {Number} high1 
 * @param {Number} low2 
 * @param {Number} high2 
 * @returns 
 */
export function remapTrim(value, low1, high1, low2, high2) {
  const n = low2 + (high2 - low2) * (value - low1) / (high1 - low1)
  return Math.max(low2, Math.min(n, high2))
}

/**
 * @export
 * @param {Number} value1 
 * @param {Number} value2 
 * @param {Number} rate 0 ~ 1
 * @returns 
 */
export function lerp(value1, value2, rate) {
  return value1 + (value2 - value1) * rate
}

