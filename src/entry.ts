import { FormLib } from "DMLib"
import { Autocraft, DoMarkItems, DoSell } from "items"
import { LA, mcm, modNameDisplay } from "shared"
import { Debug, ObjectReference, on, once } from "skyrimPlatform"
import {
  AmmoL,
  ArmorsL,
  AutoIngredientsL,
  BooksL,
  invalidInverse,
  MarkedL,
  OnMark,
  OnSell,
  SkimpyL,
  WeaponsL,
} from "hotkeys"

export function main() {
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

  LA("Initialization success.")
}

const IsPlayer = (f: ObjectReference) => f.getFormID() === FormLib.playerId
const IsAlchemyLab = (f: ObjectReference) => ObjRefHasName(f, "alchemy")

const ObjRefHasName = (f: ObjectReference, name: string) =>
  f.getBaseObject()?.getName().toLowerCase().includes(name)
