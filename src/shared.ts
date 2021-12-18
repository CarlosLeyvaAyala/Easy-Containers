import { Combinators as C, DebugLib as D, FormLib, Hotkeys as H } from "DMLib"
import { printConsole, settings } from "skyrimPlatform"

export const modNameDisplay = "Easy Containers"
const mod_name = "easy-containers"
const d = D.Log.CreateAll(
  modNameDisplay,
  D.Log.LevelFromSettings(mod_name, "loggingLevel"),
  undefined,
  D.Log.FileFmt
)

/** Log **ALL** messages. */
export const LA = d.None
/** Log info. */
export const LI = d.Info
/** Log verbose. */
export const LV = d.Verbose
export const LVT = d.TapV

/** Log Hotkey */
export const LH = D.Log.Tap((k: string) => {
  printConsole(`${modNameDisplay} hotkey ${k}`)
})

/** Gets a hotkey and logs it to console. */
export const GetHotkey = (k: string) =>
  LH(k, H.FromObject(mod_name, "hotkeys", k), H.ToString)

//@ts-ignore
export const inverseHk = settings[mod_name]["hotkeys"]["inverse"] as string
