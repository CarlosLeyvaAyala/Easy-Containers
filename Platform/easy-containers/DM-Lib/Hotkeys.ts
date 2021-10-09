/**
 * Module for Hotkey related functions.
 */

import { printConsole, Input, once } from "../skyrimPlatform"

export type KeyPressEvt = () => void
export type KeyHoldEvt = (frames: number) => () => void
export const DoNothing: KeyPressEvt = () => {}
export const DoNothingOnHold: KeyHoldEvt = (_) => () => {}

/**
 * Listens for some Hotkey press / release / hold.
 *
 * @see {@link https://www.creationkit.com/index.php?title=Input_Script#DXScanCodes | DXScanCodes}
 * for possible hotkey values.
 *
 * @remarks
 * Use this ***only inside an `'update'` event***.
 *
 * @param hk The hotkey to listen for.
 *
 * @returns A function that accepts three callbacks:
 * 1. OnKeyPress
 * 1. OnKeyReleased
 * 1. OnKeyHold - This one gets how many frames has the key being held
 *
 * @example
 * const LogPress = () => { printConsole(`Key was pressed`) }
 *
 * const LogRelease = () => { printConsole(`Key was released`) }
 *
 * const LogHold: KeyHoldEvt = n => () => { printConsole(`Key has been held for ${n} frames.`) }
 *
 * const DoStuff = ListenTo(76)           // Listen to num5
 * const OnlyCareForHold = ListenTo(77)   // Listen to num6
 *
 * on('update', () => {
 *   DoStuff(LogPress, LogRelease, LogHold)
 *   OnlyCareForHold(undefined, undefined, LogHold)
 * })
 */
export function ListenTo(hk: number) {
  let old = false
  let frames = 0

  return (
    OnPress: KeyPressEvt = DoNothing,
    OnRelease: KeyPressEvt = DoNothing,
    OnHold: KeyHoldEvt = DoNothingOnHold
  ) => {
    const p = Input.isKeyPressed(hk)

    if (old !== p) {
      frames = 0
      if (p) once("update", OnPress)
      else once("update", OnRelease)
    } else if (p) {
      frames++
      once("update", OnHold(frames))
    }

    old = p
  }
}

/** Not an useful function. Use it as a template. @see {@link ListenTo} */
export const LogPress = () => {
  printConsole(`Key was pressed`)
}

/** Not an useful function. Use it as a template. @see {@link ListenTo} */
export const LogRelease = () => {
  printConsole(`Key was released`)
}

/** Not an useful function. Use it as a template. @see {@link ListenTo} */
export const LogHold: KeyHoldEvt = (n) => () => {
  printConsole(`Key has been held for ${n} frames.`)
}
