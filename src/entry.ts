import { AutocraftEnter, AutocraftExit } from "autocraft"
import {
  AmmoL,
  ArmorsL,
  AutoIngredientsL,
  BooksL,
  CheckInvalidInverseHk,
  MarkedL,
  OnMark,
  OnSell,
  SkimpyL,
  WeaponsL,
} from "hotkeys"
import { DoMarkItems, DoSell } from "items"
import { LA } from "shared"
import { on, once } from "skyrimPlatform"

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
    CheckInvalidInverseHk()
  })

  on("furnitureEnter", AutocraftEnter)

  on("furnitureExit", AutocraftExit)

  LA("Initialization success.")
}
