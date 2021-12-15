import {
  Combinators as C,
  DebugLib as D,
  DebugLib,
  FormLib,
  Hotkeys,
} from "DMLib"
import * as JDB from "JContainers/JDB"
import * as JFormMap from "JContainers/JFormMap"
import { ArmorArg, DbHandle, IsRegistered } from "skimpify-api"
import {
  Actor,
  Armor,
  Debug,
  DxScanCode,
  Form,
  Game,
  Input,
  ObjectReference,
  on,
  printConsole,
  Projectile,
  Weapon,
} from "skyrimPlatform"

export function main() {
  /** Internal name */
  const mod_name = "easy-containers"

  // Generates a logging function specific to this mod.
  const CLF = (logAt: D.Log.Level) =>
    D.Log.CreateFunction(
      D.Log.LevelFromSettings(mod_name, "loggingLevel"),
      logAt,
      "Easy Containers",
      undefined,
      D.Log.FileFmt
    )

  /** Logs messages intended to detect bottlenecks. */
  const LogO = CLF(D.Log.Level.optimization)

  /** Logs an error message. */
  const LogE = CLF(D.Log.Level.error)

  /** Logs detailed info meant for players to see. */
  const LogI = CLF(D.Log.Level.info)

  /** Logs detailed info meant only for debugging. */
  const LogV = CLF(D.Log.Level.verbose)

  /** Logs a variable while initializing it. Message level: verbose. */
  const LogVT = D.Log.Tap(LogV)

  const LogHK = D.Log.Tap((msg: any) => {
    printConsole(`Easy Containers hotkey-${msg}`)
  })

  /** General item management function.
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
        FormLib.ForEachItemR(c, (item) => {
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
      C.K("Select a valid container")
    )
  }

  type InvalidItemFunc = (
    item: Form | null,
    dbHandle: number,
    container: ObjectReference
  ) => boolean

  /** Transfers all marked items in player inventory to the selected container in the crosshair.\
   * Equiped and favorited items are not transferred.
   */
  function DoTransferItems(IsInvalid: InvalidItemFunc) {
    return () =>
      ManageItems(
        "Transferring items to container.",
        (c, h) => {
          const p = Game.getPlayer() as Actor
          let n = 0
          FormLib.ForEachItemR(p, (item) => {
            if (IsInvalid(item, h, c) || IsEquipOrFav(item, p)) return

            p.removeItem(item, p.getItemCount(item), true, c) // Remove all items belonging to the marked type
            n++
          })
          return `${n} items were transferred`
        },
        C.K("Select a valid container")
      )
  }

  const H = (hk: number) => Hotkeys.DxScanCode[hk]

  const Read = Hotkeys.FromSettings
  const hkMark1 = LogHK("mark1", Read(mod_name, "hkMark1"), H)
  const hkTransfer1 = LogHK("transfer1", Read(mod_name, "hkTransfer1"), H)
  const hkTrUWeapArmr = LogHK(
    "unmarked weap/armors",
    Read(mod_name, "hkTrUWeapArmr"),
    H
  )
  const hkSkimpyU = LogHK("Unregistered Skimpy", Read(mod_name, "hkSkimpyU"), H)
  const hkSkimpyR = LogHK("Registered Skimpy", Read(mod_name, "hkSkimpyR"), H)

  /** React when the player presses the "Mark" hotkey. */
  const OnMark1 = Hotkeys.ListenTo(hkMark1)

  /** React when the player presses the "Transfer" hotkey. */
  const OnTransfer1 = Hotkeys.ListenTo(hkTransfer1)

  /** React when the player presses the "Transfer" hotkey. */
  const OnTrUWA = Hotkeys.ListenTo(hkTrUWeapArmr)

  /** React when the player presses the "Transfer unregistered skimpy" hotkey. */
  const OnSkimpyU = Hotkeys.ListenTo(hkSkimpyU)

  /** React when the player presses the "Transfer registered skimpy" hotkey. */
  const OnSkimpyR = Hotkeys.ListenTo(hkSkimpyR)

  /** Transfer only marked items. */
  const DoTransfer1 = DoTransferItems(IsNotDbRegistered)
  // (i: Form | null, h: number) => !JFormMap.hasKey(h, i)

  /** Transfer unmarked weapons and armors. */
  const DoTrUWA = DoTransferItems(
    (i) => !(Armor.from(i) || Weapon.from(i) || Projectile.from(i))
  )

  function TranferSkimpy(f: (a: ArmorArg) => boolean) {
    return (i: Form | null) => {
      const aa = Armor.from(i)
      return !aa ? false : f(aa)
    }
  }

  const DoTrSkimpyR = DoTransferItems(TranferSkimpy((a) => !IsRegistered(a)))
  const DoTrSkimpyU = DoTransferItems(TranferSkimpy(IsRegistered))

  printConsole("Easy Containers successfully initialized.")

  /** This code is executed every single frame.
   * It runs fast because most of the time it will only be asking if a key is pressed.
   * It's only when a key is pressed when all code above gets fired for just one frame.
   *
   * You can see how all of this is accomplished using `once()` if you check the code for
   * `Hotkey.ListenTo()`.
   */
  on("update", () => {
    if (
      Input.isKeyPressed(DxScanCode.LeftControl) ||
      Input.isKeyPressed(DxScanCode.RightControl)
    )
      OnTransfer1(DoSell)
    else OnTransfer1(DoTransfer1)
    OnMark1(DoMarkItems)
    OnTrUWA(DoTrUWA)

    OnSkimpyR(DoTrSkimpyR)
    OnSkimpyU(DoTrSkimpyU)
  })
}

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

const IsNotDbRegistered = (i: Form | null, h: number) => !JFormMap.hasKey(h, i)

const IsEquipOrFav = (i: Form | null, a: Actor) =>
  a.isEquipped(i) || a.getEquippedObject(0) === i || Game.isObjectFavorited(i)

function DoSell() {
  const p = Game.getPlayer() as Actor
  const h = GetDbHandle()
  let gold = 0
  let n = 0
  FormLib.ForEachItemR(p, (i) => {
    if (!i || IsNotDbRegistered(i, h) || IsEquipOrFav(i, p)) return
    const q = p.getItemCount(i)
    gold += i.getGoldValue() * q
    p.removeItem(i, q, true, null)
    n++
  })

  p.addItem(Game.getFormEx(0xf), gold, true)
  Debug.messageBox(`${n} items were sold for ${gold}`)
}
