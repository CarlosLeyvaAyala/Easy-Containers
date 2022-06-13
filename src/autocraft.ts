import { FormLib } from "DMLib"
import { Autocraft } from "items"
import { mcm } from "shared"
import { FurnitureEvent, ObjectReference } from "skyrimPlatform"

const ObjRefHasName = (f: ObjectReference, name: string) =>
  f.getBaseObject()?.getName().toLowerCase().includes(name)

const IsPlayer = (f: ObjectReference) => f.getFormID() === FormLib.playerId
const IsAlchemyLab = (f: ObjectReference) => ObjRefHasName(f, "alchemy")

export function AutocraftEnter(e: FurnitureEvent) {
  if (!IsPlayer(e.actor)) return
  if (IsAlchemyLab(e.target) && mcm.autocraft.alchemy)
    Autocraft.Ingredients.GetFrom()
}

export function AutocraftExit(e: FurnitureEvent) {
  if (!IsPlayer(e.actor)) return
  if (IsAlchemyLab(e.target) && mcm.autocraft.alchemy)
    Autocraft.Ingredients.SendTo()
}
