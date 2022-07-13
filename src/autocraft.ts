import { FormLib, Hotkeys } from "DMLib"
import { Autocraft } from "items"
import { mcm } from "shared"
import { Form, FurnitureEvent, ObjectReference } from "skyrimPlatform"
import { playerId } from "DMLib/Actor/player"

const IsPlayer = (f: ObjectReference) => f.getFormID() === playerId
const IsAlchemyLab = FormLib.IsAlchemyLab

interface ActionFunctions {
  Alchemy: Hotkeys.KeyPressEvt
  Enchanting: Hotkeys.KeyPressEvt
  Smithing: Hotkeys.KeyPressEvt
}

export function AutocraftEnter(e: FurnitureEvent) {
  FurnitureAction(e, {
    Alchemy: Autocraft.Ingredients.GetFrom,
    Enchanting: Hotkeys.DoNothing,
    Smithing: Hotkeys.DoNothing,
  })
}

export function AutocraftExit(e: FurnitureEvent) {
  FurnitureAction(e, {
    Alchemy: Autocraft.Ingredients.SendTo,
    Enchanting: Hotkeys.DoNothing,
    Smithing: Hotkeys.DoNothing,
  })
}

function FurnitureAction(e: FurnitureEvent, a: ActionFunctions) {
  if (!IsPlayer(e.actor)) return

  // FormLib.WaitForm(e.target, 0.1, (frm: Form) => {
  //   const target = ObjectReference.from(frm)
  //   if (!target) return
  //   const cfg = mcm.autocrafting
  //   if (IsAlchemyLab(target) && cfg.alchemy.onFurniture) a.Alchemy()
  // })
}
