import * as D from "DM-Lib/Debug"
import * as Hotkey from "DM-Lib/Hotkeys"
import { ForEachItemR } from "DM-Lib/Iteration"
import * as JDB from "JContainers/JDB"
import * as JFormMap from "JContainers/JFormMap"
import { Actor, Debug, Game, on, printConsole } from "skyrimPlatform"

export function main() {
  /** Internal name */
  const mod_name = "easy-containers"

  // Generates a logging function specific to this mod.
  const CLF = (logAt: D.LoggingLevel) =>
    D.CreateLoggingFunction(
      "Easy Containers",
      D.ReadLoggingFromSettings(mod_name, "loggingLevel"),
      logAt
    )

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

  /** Marks all items in some container. */
  function DoMarkItems() {
    const container = Game.getCurrentCrosshairRef()
    if (!container) return

    Debug.notification("Marking items in container.")

    const a = LogVT("Mark. Database handle", GetDbHandle())

    let n = 0
    let i = 0
    ForEachItemR(container, (item) => {
      const name = item?.getName()
      const exists = LogVT(
        `Trying to add ${name} to database. Already added?`,
        JFormMap.hasKey(a, item)
      )

      n++
      if (exists) return
      JFormMap.setInt(a, item, 0) // `value` is irrelevant; we only want the `key` (item) to be added
      i++
      LogI(`${name} was added to database`)
    })

    SaveDbHandle(a)

    Debug.messageBox(`${n} items were marked (${i} new)`)
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

      p.removeItem(item, p.getItemCount(item), true, container) // Remove all items belonging to the marked type
      n++
    })

    Debug.messageBox(`${n} items were transferred`)
  }

  /** React when the player presses the "Mark" hotkey. */
  const MarkItems = Hotkey.ListenTo(
    Hotkey.ReadFromSettings("easy-containers", "hkMark1")
  )

  /** React when the player presses the "Transfer" hotkey. */
  const TransferItems = Hotkey.ListenTo(
    Hotkey.ReadFromSettings("easy-containers", "hkTransfer1")
  )

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
}
