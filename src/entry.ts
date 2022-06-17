import { AutocraftEnter, AutocraftExit } from "autocraft"
import { FormLib } from "DMLib"
import {
  AmmoL,
  ArmorsL,
  AutoAllL,
  AutoHomeL,
  AutoIngredientsL,
  BooksL,
  CheckInvalidInverseHk,
  MarkedL,
  OnMark,
  OnSell,
  SkimpyL,
  WeaponsL,
} from "hotkeys"
import { Autocraft, DoMarkItems, DoSell } from "items"
import { LA, mcm } from "shared"
import { on, once, printConsole } from "skyrimPlatform"

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
    AutoHomeL()
    AutoAllL()
  })

  function T() {}

  once("update", () => {
    CheckInvalidInverseHk()
  })

  on("furnitureEnter", AutocraftEnter)

  on("furnitureExit", AutocraftExit)

  LA("Initialization success.")
}
