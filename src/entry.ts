import { AutocraftEnter, AutocraftExit } from "autocraft"
import {
  AmmoL,
  ArmorsL,
  AutoAllL,
  AutoEnchantingL,
  AutoHomeL,
  AutoIngredientsL,
  AutoSmithingL,
  BooksL,
  CheckInvalidInverseHk,
  MarkL,
  OnSell,
  SkimpyL,
  TransferL,
  WeaponsL,
} from "hotkeys"
import { DoSell } from "items"
import { LA } from "shared"
import { on, once } from "skyrimPlatform"

export function main() {
  on("update", () => {
    MarkL()
    OnSell(DoSell)

    TransferL()
    WeaponsL()
    ArmorsL()
    AmmoL()
    BooksL()
    SkimpyL()

    AutoIngredientsL()
    AutoEnchantingL()
    AutoSmithingL()
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
