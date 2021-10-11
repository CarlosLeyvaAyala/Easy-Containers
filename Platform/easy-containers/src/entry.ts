import * as D from "DM-Lib/Debug"
import * as Hotkey from "DM-Lib/Hotkeys"
import { ForEachItemR } from "DM-Lib/Iteration"
import { K } from "DM-Lib/Combinators"
import * as JDB from "JContainers/JDB"
import * as JFormMap from "JContainers/JFormMap"
import {
  Actor,
  Container,
  Debug,
  Furniture,
  Game,
  ObjectReference,
  on,
  printConsole,
} from "skyrimPlatform"

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

  /**
   * General item management function.
   *
   * @remarks
   * This function:
   * - Gets a container to work on.
   * - Gets a database handle.
   * - If the container exists:
   *    - Shows a message.
   *    - Does something with that handle.
   * - If not
   *    - Runs another function.
   * - Shows the result of the operation.
   *
   * @param msgBefore Message to show before processing.
   * @param Process Function that expects an `ObjectReference` and an integer database handle. Returns a string.
   * @param OnNoContainer: Function that accepts a database handle and returns a string.
   */
  function ManageItems(
    msgBefore: string,
    Process: (container: ObjectReference, dbHandle: number) => string,
    OnNoContainer: (dbHandle: number) => string
  ) {
    /** Do actual processing */
    const DoProcessing = (c: ObjectReference, h: number) => {
      // Show some message
      Debug.notification(msgBefore)
      LogV(msgBefore)

      // Do something with the provided handle
      return Process(c, h)
    }

    // Get container
    const cn = Game.getCurrentCrosshairRef()
    // Get a database handle
    const hd = LogVT("Database handle", GetDbHandle())
    // Do something with the handle
    const msgAfter = !cn ? OnNoContainer(hd) : DoProcessing(cn, hd)

    // Show the operation results
    LogV(msgAfter)
    Debug.messageBox(msgAfter)
  }

  /** Marks all items in some container. */
  function DoMarkItems() {
    ManageItems(
      "Marking items in container.",
      (c, h) => {
        let n = 0
        let i = 0
        ForEachItemR(c, (item) => {
          const name = item?.getName()
          const exists = LogVT(
            `Trying to add ${name} to database. Already added?`,
            JFormMap.hasKey(h, item)
          )

          n++
          if (exists) return
          JFormMap.setInt(h, item, 0) // `value` is irrelevant; we only want the `key` (item) to be added
          i++
          LogI(`${name} was added to database`)
        })

        SaveDbHandle(h)
        return `${n} items were marked (${i} new)`
      },
      K("Select a valid container")
    )
  }

  /** Transfers all marked items in player inventory to the selected container in the crosshair.\
   * Equiped and favorited items are not transferred.
   */
  function DoTransferItems() {
    ManageItems(
      "Transferring items to container.",
      (c, h) => {
        const p = Game.getPlayer() as Actor
        let n = 0
        ForEachItemR(p, (item) => {
          if (
            !JFormMap.hasKey(h, item) ||
            p.isEquipped(item) ||
            p.getEquippedObject(0) === item ||
            Game.isObjectFavorited(item)
          )
            return

          p.removeItem(item, p.getItemCount(item), true, c) // Remove all items belonging to the marked type
          n++
        })
        return `${n} items were transferred`
      },
      K("Select a valid container")
    )
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
