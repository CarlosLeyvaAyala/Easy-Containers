import { DebugLib as D, Hotkeys as H } from "DMLib"
import { settings } from "skyrimPlatform"

export const modNameDisplay = "Easy Containers"
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

export const GHk = (k: string) => H.FromObject(mod_name, "hotkeys", k)

/** Gets a hotkey and logs it to console. */
export const GetHotkey = H.GetAndLog(LAT, GHk)

//@ts-ignore
export const inverseHk = settings[mod_name]["hotkeys"]["inverse"] as string
export const sellMult = settings[mod_name]["sellingMultiplier"] as number
