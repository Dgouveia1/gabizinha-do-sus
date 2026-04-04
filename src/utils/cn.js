// Simple class name utility — joins truthy strings
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
