const STEP = 1000

// Move item from sourceIndex to destIndex in array (immutable)
export function reorderItems(arr, sourceIndex, destIndex) {
  const result = [...arr]
  const [removed] = result.splice(sourceIndex, 1)
  result.splice(destIndex, 0, removed)
  return result
}

// Assign sparse integer positions (0, 1000, 2000…)
export function recalculatePositions(items) {
  return items.map((item, i) => ({ ...item, position: i * STEP }))
}

// Midpoint insertion — returns a position value between a and b
export function midpoint(a, b) {
  return Math.floor((a + b) / 2)
}
