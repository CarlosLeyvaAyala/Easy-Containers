import { settings } from "skyrimPlatform"
import { FromObject, GetAndLog } from "DmLib/hotkeys"
import { ConsoleFmt, CreateAll, FileFmt, LevelFromSettings } from "DmLib/Log"

export const modNameDisplay = "EasyContainers"
const mod_name = "easy-containers"
const d = CreateAll(
  modNameDisplay,
  LevelFromSettings(mod_name, "loggingLevel"),
  ConsoleFmt,
  FileFmt
)

/** Log **ALL** messages. */
export const LA = d.None
export const LAT = d.TapN
/** Log error. */
export const LE = d.Error
/** Log info. */
export const LI = d.Info
/** Log verbose. */
export const LV = d.Verbose
export const LVT = d.TapV

/** Get hotkey from settings */
export const GHk = (k: string) => FromObject(mod_name, "hotkeys", k)

/** Gets a hotkey and logs it to console. */
export const GetHotkey = GetAndLog(LAT, GHk)

export interface EcSettings {
  loggingLevel: string
  sellingMultiplier: number
  waitAutoAll: number
  hotkeys: { [key: string]: string }
  autocrafting: Autocrafting
}

export interface Autocrafting {
  alchemy: Alchemy
  smithing: Home
  enchanting: Enchanting
  home: Home
}

export interface Alchemy {
  onFurniture: boolean
}

export interface Enchanting {
  onFurniture: boolean
  storeEmpty: boolean
  storeFilled: boolean
  filled: string[]
  empty: string[]
  exceptions: string[]
}

export interface Home {
  onFurniture: boolean
  keywords: string[]
  forms: string[]
  exceptions: string[]
}

//@ts-ignore
export const mcm: EcSettings = settings[mod_name]
//@ts-ignore
export const inverseHk = settings[mod_name]["hotkeys"]["inverse"] as string

/** This mod database on JContainers. */
export const basePath = ".EasyContainers"
/** Where the marked items database is located. */
export const itemsPath = `${basePath}.items`
/** Where the global chests database is located. */
export const chestPath = `${basePath}.chests`
