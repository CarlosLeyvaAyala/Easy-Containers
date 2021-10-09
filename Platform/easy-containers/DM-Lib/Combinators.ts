/**
 * Functional combinators.
 */

export function T<K>(x: K, f: (x: K) => void) {
  f(x)
  return x
}

export const Tap = T
