import { Combinators as C, DebugLib as D, Hotkeys as H, Hotkeys } from "DMLib"
import { Autocraft, Category, TransferFunctions } from "items"
import { GetHotkey, GHk, inverseHk, LE, modNameDisplay } from "shared"
import { Debug } from "skyrimPlatform"

let invalidInverse = false

export function CheckInvalidInverseHk() {
  if (!invalidInverse) return
  Debug.messageBox(
    `${modNameDisplay}:\nThe hotkey for inverting operations found in your settings file is invalid.\nReverting to default: Shift.`
  )
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

interface ListeningFunctions {
  OnTransfer: Hotkeys.ListeningFunction
  OnTransferInv: Hotkeys.ListeningFunction
  OnTransferAll?: Hotkeys.ListeningFunction
}

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

export const OnMark = L("mark")
export const OnSell = L("sell")
const Marked = CreateListeningFuncs("transfer", "transferAll")
const Weapons = CreateListeningFuncs("weapon", "allWeapons")
const Armors = CreateListeningFuncs("armor", "allArmors")
const Ammos = CreateListeningFuncs("ammo", "allAmmo")
const Books = CreateListeningFuncs("book", "allBooks")
const Skimpy = CreateListeningFuncs("skimpy")

const AutoIngredients = CreateListeningFuncs("autoIngredients")
const AutoHome = CreateListeningFuncs("autoHome")
const AutoAll = CreateListeningFuncs("autoAll")

/** Listen to hotkeys related to marked items */
export const MarkedL = GenListeners(Marked, Category.Marked)
/** Listen to hotkeys related to armors */
export const ArmorsL = GenListeners(Armors, Category.Armors)
/** Listen to hotkeys related to weapons */
export const WeaponsL = GenListeners(Weapons, Category.Weapons)
/** Listen to hotkeys related to ammo */
export const AmmoL = GenListeners(Ammos, Category.Ammos)
/** Listen to hotkeys related to books */
export const BooksL = GenListeners(Books, Category.Books)
/** Listen to hotkeys related to skimpy armors */
export const SkimpyL = GenListeners(Skimpy, Category.Skimpy)

// Listen to hotkeys related to auto craftloot ingredients
export const AutoIngredientsL = GenAutocraftL(
  AutoIngredients,
  Autocraft.Ingredients
)

export const AutoHomeL = GenAutocraftL(AutoHome, Autocraft.Home)
export const AutoAllL = GenAutocraftL(AutoAll, Autocraft.All)
