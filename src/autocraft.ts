import { FormLib, Hotkeys } from "DMLib"
import { Autocraft } from "items"
import { mcm } from "shared"
import { FurnitureEvent, ObjectReference } from "skyrimPlatform"

const IsPlayer = (f: ObjectReference) => f.getFormID() === FormLib.playerId
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
  if (IsAlchemyLab(e.target) && mcm.autocrafting.alchemy.onFurniture)
    a.Alchemy()
}
