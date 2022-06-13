import { DebugLib as D, Hotkeys as H } from "DMLib"
import { settings } from "skyrimPlatform"

export const modNameDisplay = "EasyContainers"
const mod_name = "easy-containers"
const d = D.Log.CreateAll(
  modNameDisplay,
  D.Log.LevelFromSettings(mod_name, "loggingLevel"),
  D.Log.ConsoleFmt,
  D.Log.FileFmt
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
export const GHk = (k: string) => H.FromObject(mod_name, "hotkeys", k)

/** Gets a hotkey and logs it to console. */
export const GetHotkey = H.GetAndLog(LAT, GHk)

export interface EcSettings {
  loggingLevel: string
  sellingMultiplier: number
  autocraft: Autocraft
  hotkeys: { [key: string]: string }
}

export interface Autocraft {
  alchemy: boolean
  smithing: boolean
  enchanting: boolean
}

//@ts-ignore
export const mcm: EcSettings = settings[mod_name]
//@ts-ignore
export const inverseHk = settings[mod_name]["hotkeys"]["inverse"] as string
// export const sellMult = settings[mod_name]["sellingMultiplier"] as number

/** This mod database on JContainers. */
export const basePath = ".EasyContainers"
/** Where the marked items database is located. */
export const itemsPath = `${basePath}.items`
/** Where the global chests database is located. */
export const chestPath = `${basePath}.chests`
