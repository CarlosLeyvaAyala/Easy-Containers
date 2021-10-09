import { Actor, Debug, Game, on, printConsole } from "skyrimPlatform"
import * as Hotkey from "DM-Lib/Hotkeys"
import * as D from "DM-Lib/Debug"
import { ForEachItemR } from "DM-Lib/Iteration"
import * as JFormMap from "JContainers/JFormMap"
import * as JDB from "JContainers/JDB"

export function main() {
  const modName = "Easy Containers"

  // TODO: Make configurable
  /** Current logging level. */
  const currLogLvl = D.LoggingLevel.Verbose

  // Generates a logging function specific to this mod.
  const CLF = (logAt: D.LoggingLevel) =>
    D.CreateLoggingFunction(modName, currLogLvl, logAt)

  /** Logs messages intended to detect bottlenecks. */
  const LogO = CLF(D.LoggingLevel.Optimization)

  /** Logs an error message. */
  const LogE = CLF(D.LoggingLevel.Error)

  /** Logs detailed info meant for players to see. */
  const LogI = CLF(D.LoggingLevel.Info)

  /** Logs detailed info meant only for debugging. */
  const LogV = CLF(D.LoggingLevel.Verbose)

  /** Logs a variable while initializing it. Message level: info. */
  const LogIT = D.TapLog(LogI)

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

  /** Marks all items in some container. */
  function DoMarkItems() {
    const container = Game.getCurrentCrosshairRef()
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

  /** React when the player presses the "Mark" hotkey. */
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

  // on("equip", (e) => {
  //   const b = e.actor.getBaseObject()
  //   // if (b) printConsole(`EQUIP. actor: ${b.getName()}. object: ${e.baseObj.getName()}`);
  // });

  // on("objectLoaded", (e) => {
  //   const a = Actor.from(e.object)
  //   const l = Actor.from(e.object)?.getLeveledActorBase()
  //   printConsole(`Leveled actor name ${l?.getName()} race: ${l?.getRace()?.getName()} class: ${l?.getClass()?.getName()}`)
  //   const base = Actor.from(e.object)?.getBaseObject()
  //   printConsole(`Base actor name ${base?.getName()}`)
  //   // printConsole(`UNLOADED raw name ${e.object?.getName()}`)
  //   const b = Actor.from(e.object)?.getLeveledActorBase()
  //   if (b) {
  //     const r = ActorBase.from(b)?.getRace()
  //     const c = ActorBase.from(b)?.getClass()
  //     // printConsole(`(UN)LOADED object: ${b.getName()}. loaded: ${e.isLoaded} class: ${c?.getName()} race: ${r?.getName()}`);
  //   }
  // });

  // on("unequip", (e) => {
  //   const b = e.actor.getBaseObject()
  //   // if (b) printConsole(`UNEQUIP. actor: ${b.getName()}. object: ${e.baseObj.getName()}`);
  // });
}
