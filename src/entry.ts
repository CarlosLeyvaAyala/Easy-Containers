import {
  Combinators as C,
  DebugLib as D,
  FormLib,
  Hotkeys as H,
  Hotkeys,
} from "DMLib"
import {
  Autocraft,
  Category,
  DoMarkItems,
  DoSell,
  TransferFunctions,
} from "items"
import { GetHotkey, GHk, inverseHk, LA, LE, mcm, modNameDisplay } from "shared"
import { Debug, ObjectReference, on, once } from "skyrimPlatform"

interface ListeningFunctions {
  OnTransfer: Hotkeys.ListeningFunction
  OnTransferInv: Hotkeys.ListeningFunction
  OnTransferAll?: Hotkeys.ListeningFunction
}

let invalidInverse = false
export function main() {
  /** Listen to some hotkey by its name in the settings file */
  const L = (k: string) => H.ListenTo(GetHotkey(k))
  const LI = (k: string) => H.ListenTo(Inv(GHk(k)))

  function CreateListeningFuncs(
    hotkeyName: string,
    hotkeyAll?: string
  ): ListeningFunctions {
    return {
      OnTransfer: L(hotkeyName),
      OnTransferInv: LI(hotkeyName),
      OnTransferAll: hotkeyAll ? L(hotkeyAll) : undefined,
    }
  }

  const OnMark = L("mark")
  const OnSell = L("sell")
  const Marked = CreateListeningFuncs("transfer", "transferAll")
  const Weapons = CreateListeningFuncs("weapon", "allWeapons")
  const Armors = CreateListeningFuncs("armor", "allArmors")
  const Ammos = CreateListeningFuncs("ammo", "allAmmo")
  const Books = CreateListeningFuncs("book", "allBooks")
  const Skimpy = CreateListeningFuncs("skimpy")

  const AutoIngredients = CreateListeningFuncs("autoIngredients")

  LA("Initialization success.")

  /** Creates a function that listens to many hotkeys. */
  function GenListeners(
    listeners: ListeningFunctions,
    callbacks: TransferFunctions
  ) {
    const All = listeners.OnTransferAll
    if (!All)
      return () => {
        listeners.OnTransfer(callbacks.Transfer)
        listeners.OnTransferInv(callbacks.TransferInv)
      }

    return () => {
      listeners.OnTransfer(callbacks.Transfer)
      listeners.OnTransferInv(callbacks.TransferInv)
      All(callbacks.TransferAll)
    }
  }

  /** Creates a function that listens to many hotkeys related to auto craftloot. */
  function GenAutocraftL(
    listeners: ListeningFunctions,
    callbacks: Autocraft.AutocraftFunctions
  ) {
    return () => {
      listeners.OnTransfer(callbacks.SendTo)
      listeners.OnTransferInv(callbacks.GetFrom)
    }
  }

  const MarkedL = GenListeners(Marked, Category.Marked)
  const ArmorsL = GenListeners(Armors, Category.Armors)
  const WeaponsL = GenListeners(Weapons, Category.Weapons)
  const AmmoL = GenListeners(Ammos, Category.Ammos)
  const BooksL = GenListeners(Books, Category.Books)
  const SkimpyL = GenListeners(Skimpy, Category.Skimpy)

  const AutoIngredientsL = GenAutocraftL(AutoIngredients, Autocraft.Ingredients)

  on("update", () => {
    OnMark(DoMarkItems)
    OnSell(DoSell)

    MarkedL()
    WeaponsL()
    ArmorsL()
    AmmoL()
    BooksL()
    SkimpyL()

    AutoIngredientsL()
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
