import { Combinators as C, DebugLib as D, Hotkeys as H, Hotkeys } from "DMLib"
import {
  DoMarkItems,
  DoSell,
  DoTransfer,
  DoTransferAll,
  DoTransferArmor,
  DoTransferArmorAll,
  DoTransferArmorI,
  DoTransferI,
  DoTransferWeapons,
  DoTransferWeaponsAll,
  DoTransferWeaponsI,
  DoTrSkimpy,
  DoTrSkimpyI,
} from "items"
import { GetHotkey, inverseHk, LA, LE, modNameDisplay } from "shared"
import { Debug, on, once, printConsole } from "skyrimPlatform"

let invalidInverse = false
export function main() {
  // const Inverse =
  //   inverseHk === "Alt"
  //     ? H.IsAltPressed
  //     : inverseHk === "Ctrl"
  //     ? H.IsCtrlPressed
  //     : inverseHk === "Shift"
  //     ? H.IsShiftPressed
  //     : C.Return(MarkInvalidInv(), H.IsShiftPressed)

  /** Listen to some hotkey by its name in the settings file */
  const L = (k: string) => H.ListenTo(GetHotkey(k))
  const LI = (k: string) => H.ListenTo(Inv(GetHotkey(k)))

  const OnMark = L("mark")
  const OnTransfer = L("transfer")
  const OnTransferI = LI("transfer")
  const OnTransferWeapon = L("weapon")
  const OnTransferWeaponI = LI("weapon")
  const OnTransferArmor = L("armor")
  const OnTransferArmorI = LI("armor")
  const OnTransferSkimpy = L("skimpy")
  const OnTransferSkimpyI = LI("skimpy")

  const OnTransferAll = L("transferAll")
  const OnTransferAllWeapons = L("allWeapons")
  const OnTransferAllArmors = L("allArmors")

  const OnSell = L("sell")

  LA("Initialization success.")

  on("update", () => {
    OnSell(DoSell)
    OnTransferAll(DoTransferAll)
    OnTransferAllWeapons(DoTransferWeaponsAll)
    OnTransferAllArmors(DoTransferArmorAll)

    OnMark(DoMarkItems)
    OnTransfer(DoTransfer)
    OnTransferI(DoTransferI)
    OnTransferWeapon(DoTransferWeapons)
    OnTransferWeaponI(DoTransferWeaponsI)
    OnTransferArmor(DoTransferArmor)
    OnTransferArmorI(DoTransferArmorI)

    OnTransferSkimpy(DoTrSkimpy)
    OnTransferSkimpyI(DoTrSkimpyI)
  })

  once("update", () => {
    if (!invalidInverse) return
    Debug.messageBox(
      `${modNameDisplay}:\nThe hotkey for inverting operations found in your settings file is invalid.\nReverting to default: Shift.`
    )
  })
}

const MarkInvalidInv = () => {
  invalidInverse = true
}

function Inv(h: Hotkeys.Hotkey): Hotkeys.Hotkey {
  const E = () =>
    LE(
      `***ERROR*** Hotkey ${H.ToString(h)} already contains the inverse hotkey.`
    )
  const A = (v: boolean | undefined) => (v ? D.Log.R(E(), true) : true)
  let m = h.modifiers ? h.modifiers : {}

  if (inverseHk === "Alt") m.alt = A(m.alt)
  else if (inverseHk === "Ctrl") m.ctrl = A(m.ctrl)
  else if (inverseHk === "Shift") m.shift = A(m.shift)
  else m.shift = C.Return(MarkInvalidInv(), true) // Default to shift and inform to player

  return { hk: h.hk, modifiers: m }
}
