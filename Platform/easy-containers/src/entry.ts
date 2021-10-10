import * as D from "DM-Lib/Debug"
import * as Hotkey from "DM-Lib/Hotkeys"
import { ForEachItemR } from "DM-Lib/Iteration"
import { AvoidRapidFire, ListenPapyrusEvent } from "DM-Lib/Misc"
import * as JDB from "JContainers/JDB"
import * as JMap from "JContainers/JMap"
import * as JFormMap from "JContainers/JFormMap"
import {
  Actor,
  Debug,
  Game,
  hooks,
  on,
  printConsole,
  Utility,
  settings,
  Form,
} from "skyrimPlatform"

export function main() {
  const modName = "Easy Containers"
  const mod_name = "easy-containers"

  /** Current logging level. */
  const currLogLvl = D.ReadLoggingFromSettings(mod_name, "loggingLevel")
  printConsole(currLogLvl)

  // Generates a logging function specific to this mod.
  const CLF = (logAt: D.LoggingLevel) =>
    D.CreateLoggingFunction(modName, currLogLvl, logAt)

  /** Logs messages intended to detect bottlenecks. */
  const LogO = CLF(D.LoggingLevel.optimization)

  /** Logs an error message. */
  const LogE = CLF(D.LoggingLevel.error)

  /** Logs detailed info meant for players to see. */
  const LogI = CLF(D.LoggingLevel.info)

  /** Logs detailed info meant only for debugging. */
  const LogV = CLF(D.LoggingLevel.verbose)

  /** Logs a variable while initializing it. Message level: verbose. */
  const LogVT = D.TapLog(LogV)

  /** Where the marked items database is located. */
  const basePath = ".EasyContainers.items"

  /** Gets a memory database handle to a JContainers object, creating it if it doesn't exist. */
  function GetDbHandle(): number {
    const r = JDB.solveObj(basePath)
    return r !== 0 ? r : JFormMap.object()
  }

  /** Saves a JContainers object handle to the memory database. */
  function SaveDbHandle(h: number) {
    JDB.solveObjSetter(basePath, h, true)
  }

  const IntToHex = (x: number) => x.toString(16)

  function GetFormEsp(frm: Form | null | undefined) {
    if (!frm) return ""

    const formId = LogVT("FormId", frm.getFormID(), IntToHex)
    const modIndex = LogVT("modIndex", formId >>> 24, IntToHex)
    const modForm = LogVT("modForm", formId & 0xffffff, IntToHex)
    let name = ""

    if (modIndex == 0xfe) {
      const lightIndex = LogVT(
        "Light mod index",
        (formId >>> 12) & 0xfff,
        IntToHex
      )
      if (lightIndex < Game.getLightModCount())
        name = Game.getLightModName(lightIndex)
      else return ""
    } else name = Game.getModName(modIndex)
    // printConsole(name)
    return name
    // UInt8 modIndex = form->formID >> 24;
    // UInt32 modForm = form->formID & 0xFFFFFF;
    // ModInfo* modInfo = nullptr;
    // if (modIndex == 0xFE)
    // {
    //   UInt16 lightIndex = (form->formID >> 12) & 0xFFF;
    //   if (lightIndex < (*g_dataHandler)->modList.loadedCCMods.count)
    //     modInfo = (*g_dataHandler)->modList.loadedCCMods[lightIndex];
    // }
    // else
    // {
    //   modInfo = (*g_dataHandler)->modList.loadedMods[modIndex];
    // }

    // if (modInfo) {
    //   sprintf_s(formName, "%s|%06X", modInfo->name, modForm);
    // }

    // return formName;
  }

  /** Marks all items in some container. */
  function DoMarkItems() {
    const container = Game.getCurrentCrosshairRef()

    GetFormEsp(
      container ? container.getBaseObject() : Game.getPlayer()?.getBaseObject()
    )

    if (!container) return

    Debug.notification("Marking items in container.")

    const a = LogVT("Mark. Database handle", GetDbHandle())

    ForEachItemR(container, (item) => {
      const name = item?.getName()
      const exists = LogVT(
        `Trying to add ${name} to database. Already added?`,
        JFormMap.hasKey(a, item)
      )

      if (exists) return
      JFormMap.setInt(a, item, 0) // `value` is irrelevant; we only want the `key` (item) to be added
      LogI(`${name} was added to database`)
    })

    SaveDbHandle(a)

    Debug.messageBox("All items were marked")
  }

  /** Transfers all marked items in player inventory to the selected container in the crosshair.\
   * Equiped and favorited items are not transferred.
   */
  function DoTransferItems() {
    const container = Game.getCurrentCrosshairRef()
    if (!container) return

    Debug.notification("Transferring items to container.")

    const p = Game.getPlayer() as Actor
    const a = LogVT("Transfer. Database handle", GetDbHandle())
    let n = 0
    ForEachItemR(p, (item) => {
      if (
        !JFormMap.hasKey(a, item) ||
        p.isEquipped(item) ||
        p.getEquippedObject(0) === item ||
        Game.isObjectFavorited(item)
      )
        return

      p.removeItem(item, 999999, true, container) // Remove all items belonging to the marked type
      n++
    })

    Debug.messageBox(`${n} items were transferred`)
  }

  printConsole(settings["easy-containers"]["hkMark1"])
  printConsole(settings["easy-containers"]["hkTransfer1"])
  const l = settings["easy-containers"]["hkMark1"]
  const l2 = typeof l === "number" ? l : 0

  /** React when the player presses the "Mark" hotkey. */
  // const MarkItems = Hotkey.ListenTo(l2)
  const MarkItems = Hotkey.ListenTo(75)
  /** React when the player presses the "Transfer" hotkey. */
  const TransferItems = Hotkey.ListenTo(76)

  printConsole("Easy Containers successfully initialized.")

  /** This code is executed every single frame.
   * It runs fast because most of the time it will only be asking if a key is pressed.
   * It's only when a key is pressed when all code above gets fired for just one frame.
   *
   * You can see how all of this is accomplished using `once()` if you check the code for
   * `Hotkey.ListenTo()`.
   */
  on("update", () => {
    MarkItems(DoMarkItems)
    TransferItems(DoTransferItems)
  })

  // ===========================================================
  // Meh. Ignore all lines below.
  // I was testing things for other mod and I don't want to lose those tests.
  // I will eventually delete these lines.
  // ===========================================================

  let lastSlept = 0
  let goneToSleepAt = 0
  const Now = Utility.getCurrentGameTime

  let OnSleepStart = () => {
    goneToSleepAt = LogVT("OnSleepStart", Now())
  }

  let OnSleepEnd = () => {
    if (Now() - lastSlept < 2) {
      LogE("You just slept. Nothing will be done.")
      lastSlept = LogVT("Awaken at", Now())
      return
    }

    const hoursSlept = LogVT("Time slept", Now() - goneToSleepAt)
    if (hoursSlept < 1) return // Do nothing. Didn't really slept.
    lastSlept = LogVT("Awaken at", Now())

    //   const p = Game.getPlayer() as Actor
    //   p.sendModEvent("Maxick_JourneyByAverage", "", 9000)
  }

  OnSleepStart = AvoidRapidFire(OnSleepStart)
  OnSleepEnd = AvoidRapidFire(OnSleepEnd)

  const SleepStart = ListenPapyrusEvent("OnSleepStart")
  const SleepEnd = ListenPapyrusEvent("OnSleepStop")
  const CellAttach = ListenPapyrusEvent("OnCellAttach")

  hooks.sendPapyrusEvent.add({
    enter(ctx) {
      SleepStart(ctx, OnSleepStart)
      SleepEnd(ctx, OnSleepEnd)
    },
  })

  // on("equip", (e) => {
  //   const b = e.actor.getBaseObject()
  //   // if (b) printConsole(`EQUIP. actor: ${b.getName()}. object: ${e.baseObj.getName()}`);
  // });

  on("objectLoaded", (e) => {
    const a = Actor.from(e.object)?.getBaseObject()
    const formId = LogVT("FormId", e.object.getFormID(), IntToHex)
    printConsole(`Name: ${a?.getName()}`)
    // const l = Actor.from(Game.getFormEx(formId))?.getLeveledActorBase()
    // printConsole(
    //   `Leveled actor name ${l?.getName()} race: ${l
    //     ?.getRace()
    //     ?.getName()} class: ${l?.getClass()?.getName()}`
    // )
    // const base = Actor.from(e.object)?.getBaseObject()
    // printConsole(`Base actor name ${base?.getName()}`)
    // printConsole(`UNLOADED raw name ${e.object?.getName()}`)
    // const b = Actor.from(e.object)?.getLeveledActorBase()
    // if (b) {
    // const r = ActorBase.from(b)?.getRace()
    // const c = ActorBase.from(b)?.getClass()
    // printConsole(`(UN)LOADED object: ${b.getName()}. loaded: ${e.isLoaded} class: ${c?.getName()} race: ${r?.getName()}`);
    // }
  })

  // on("unequip", (e) => {
  //   const b = e.actor.getBaseObject()
  //   // if (b) printConsole(`UNEQUIP. actor: ${b.getName()}. object: ${e.baseObj.getName()}`);
  // });
}
