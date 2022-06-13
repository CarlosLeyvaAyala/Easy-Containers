import {
  Combinators as C,
  DebugLib as D,
  FormLib,
  Hotkeys as H,
  Hotkeys,
} from "DMLib"
import {
  Autocraft,
  DoMarkItems,
  DoSell,
  DoTransfer,
  DoTransferAll,
  DoTransferAmmo,
  DoTransferAmmoAll,
  DoTransferAmmoI,
  DoTransferArmor,
  DoTransferArmorAll,
  DoTransferArmorI,
  DoTransferBookAll,
  DoTransferBooks,
  DoTransferBooksI,
  DoTransferI,
  DoTransferWeapons,
  DoTransferWeaponsAll,
  DoTransferWeaponsI,
  DoTrSkimpy,
  DoTrSkimpyI,
} from "items"
import { GetHotkey, GHk, inverseHk, LA, LE, mcm, modNameDisplay } from "shared"
import {
  Debug,
  Furniture,
  ObjectReference,
  on,
  once,
  printConsole,
} from "skyrimPlatform"

interface ListeningFunctions {
  OnTransfer: Hotkeys.ListeningFunction
  OnTransferInv: Hotkeys.ListeningFunction
}

let invalidInverse = false
export function main() {
  /** Listen to some hotkey by its name in the settings file */
  const L = (k: string) => H.ListenTo(GetHotkey(k))
  const LI = (k: string) => H.ListenTo(Inv(GHk(k)))

  function CreateListeningFuncs(hotkeyName: string): ListeningFunctions {
    return { OnTransfer: L(hotkeyName), OnTransferInv: LI(hotkeyName) }
  }

  // ===================
  // Replace "XXX" with whatever thing you want to get
  // ===================
  // const OnTransferXXX = L("XXX")
  // const OnTransferXXXI = LI("XXX")
  // const OnTransferAllXXXs = L("allXXXs")

  const OnMark = L("mark")
  const OnTransfer = L("transfer")
  const OnTransferI = LI("transfer")
  const OnTransferWeapon = L("weapon")
  const OnTransferWeaponI = LI("weapon")
  const OnTransferAmmo = L("ammo")
  const OnTransferAmmoI = LI("ammo")
  const OnTransferArmor = L("armor")
  const OnTransferArmorI = LI("armor")
  const OnTransferBook = L("book")
  const OnTransferBookI = LI("book")
  const OnTransferSkimpy = L("skimpy")
  const OnTransferSkimpyI = LI("skimpy")

  const OnTransferAll = L("transferAll")
  const OnTransferAllWeapons = L("allWeapons")
  const OnTransferAllAmmo = L("allAmmo")
  const OnTransferAllArmors = L("allArmors")
  const OnTransferAllBooks = L("allBooks")
  const Ingredients = CreateListeningFuncs("autoIngredients")

  const OnSell = L("sell")

  LA("Initialization success.")

  // OnTransferAllXXXs(DoTransferXXXAll)
  // OnTransferXXX(DoTransferXXX)
  // OnTransferXXXI(DoTransferXXXI)

  on("update", () => {
    OnSell(DoSell)
    OnTransferAll(DoTransferAll)
    OnTransferAllWeapons(DoTransferWeaponsAll)
    OnTransferAllAmmo(DoTransferAmmoAll)
    OnTransferAllArmors(DoTransferArmorAll)
    OnTransferAllBooks(DoTransferBookAll)

    OnMark(DoMarkItems)
    OnTransfer(DoTransfer)
    OnTransferI(DoTransferI)
    OnTransferWeapon(DoTransferWeapons)
    OnTransferWeaponI(DoTransferWeaponsI)
    OnTransferAmmo(DoTransferAmmo)
    OnTransferAmmoI(DoTransferAmmoI)
    OnTransferArmor(DoTransferArmor)
    OnTransferArmorI(DoTransferArmorI)
    OnTransferBook(DoTransferBooks)
    OnTransferBookI(DoTransferBooksI)

    Ingredients.OnTransfer(Autocraft.Ingredients.SendTo)
    Ingredients.OnTransferInv(Autocraft.Ingredients.GetFrom)

    OnTransferSkimpy(DoTrSkimpy)
    OnTransferSkimpyI(DoTrSkimpyI)
  })

  once("update", () => {
    if (!invalidInverse) return
    Debug.messageBox(
      `${modNameDisplay}:\nThe hotkey for inverting operations found in your settings file is invalid.\nReverting to default: Shift.`
    )
  })

  on("furnitureEnter", (e) => {
    if (!IsPlayer(e.actor)) return
    if (IsAlchemyLab(e.target) && mcm.autocraft.alchemy)
      Autocraft.Ingredients.GetFrom()
  })

  on("furnitureExit", (e) => {
    if (!IsPlayer(e.actor)) return
    if (IsAlchemyLab(e.target) && mcm.autocraft.alchemy)
      Autocraft.Ingredients.SendTo()
  })
}

const IsPlayer = (f: ObjectReference) => f.getFormID() === FormLib.playerId
const IsAlchemyLab = (f: ObjectReference) => ObjRefHasName(f, "alchemy")

const ObjRefHasName = (f: ObjectReference, name: string) =>
  f.getBaseObject()?.getName().toLowerCase().includes(name)

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
