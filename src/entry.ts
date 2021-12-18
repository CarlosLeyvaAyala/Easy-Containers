import { Combinators as C, Hotkeys as H } from "DMLib"
import {
  DoMarkItems,
  DoSell,
  DoTransferAll,
  DoTransferWeapons,
  DoTrSkimpy,
} from "items"
import { GetHotkey, inverseHk, LA, modNameDisplay } from "shared"
import { Debug, on, once } from "skyrimPlatform"

export function main() {
  let invalidInverse = false
  const MarkInvalidInv = () => {
    invalidInverse = true
  }
  const Inverse =
    inverseHk === "Alt"
      ? H.IsAltPressed
      : inverseHk === "Ctrl"
      ? H.IsCtrlPressed
      : inverseHk === "Shift"
      ? H.IsShiftPressed
      : C.Return(MarkInvalidInv(), H.IsShiftPressed)

  const hkMarkAll = GetHotkey("markAll")
  const hkTransferAll = GetHotkey("transferAll")
  const hkTransferWeapon = GetHotkey("transferWeapon")
  const hkTransferSkimpy = GetHotkey("transferSkimpy")
  const hkSell = GetHotkey("sell")

  const OnMarkAll = H.ListenTo(hkMarkAll)
  const OnTransferAll = H.ListenTo(hkTransferAll)
  const OnTransferWeapon = H.ListenTo(hkTransferWeapon)
  const OnTransferSkimpy = H.ListenTo(hkTransferSkimpy)
  const OnSell = H.ListenTo(hkSell)

  LA("Initialization success.")

  on("update", () => {
    OnSell(DoSell)

    if (Inverse()) {
    } else {
      OnTransferAll(DoTransferAll)
      OnMarkAll(DoMarkItems)
      OnTransferWeapon(DoTransferWeapons)
      OnTransferSkimpy(DoTrSkimpy)
    }
  })

  once("update", () => {
    if (!invalidInverse) return
    Debug.messageBox(
      `${modNameDisplay}:\nThe hotkey for inverting operations found in your settings file is invalid.\nReverting to default: Shift.`
    )
  })
}
