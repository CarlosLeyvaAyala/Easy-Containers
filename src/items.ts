import { ArmorArg, IsNotRegistered, IsRegistered } from "skimpify-api"
import { Combinators as C, FormLib } from "DMLib"
import * as JDB from "JContainers/JDB"
import * as JFormMap from "JContainers/JFormMap"
import {
  Actor,
  Armor,
  Debug,
  Form,
  Game,
  ObjectReference,
  Projectile,
  Weapon,
} from "skyrimPlatform"
import { LI, LV, LVT } from "./shared"

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
export function ManageItems(
  msgBefore: string,
  Process: (container: ObjectReference, dbHandle: number) => string,
  OnNoContainer: (dbHandle: number) => string
) {
  /** Do actual processing */
  const DoProcessing = (c: ObjectReference, h: number) => {
    // Show some message
    Debug.notification(msgBefore)
    LV(msgBefore)

    // Do something with the provided handle
    return Process(c, h)
  }

  // Get container
  const cn = Game.getCurrentCrosshairRef()
  // Get a database handle
  const hd = LVT("Database handle", GetDbHandle())
  // Do something with the handle
  const msgAfter = !cn ? OnNoContainer(hd) : DoProcessing(cn, hd)

  // Show the operation results
  LV(msgAfter)
  Debug.messageBox(msgAfter)
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

export function DoSell() {
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

/** Marks all items in some container. */
export function DoMarkItems() {
  ManageItems(
    "Marking items in container.",
    (c, h) => {
      let n = 0
      let i = 0
      FormLib.ForEachItemR(c, (item) => {
        const name = item?.getName()
        const exists = LVT(
          `Trying to add ${name} to database. Already added?`,
          JFormMap.hasKey(h, item)
        )

        n++
        if (exists) return
        JFormMap.setInt(h, item, 0) // `value` is irrelevant; we only want the `key` (item) to be added
        i++
        LI(`${name} was added to database`)
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

/** Transfer only marked items. */
export const DoTransferAll = DoTransferItems(IsNotDbRegistered)

/** Transfer unmarked weapons and armors. */
export const DoTransferWeapons = DoTransferItems(
  (i) => !(Armor.from(i) || Weapon.from(i) || Projectile.from(i))
)
function TranferSkimpy(f: (a: ArmorArg) => boolean) {
  return (i: Form | null) => {
    const aa = Armor.from(i)
    return !aa ? false : f(aa)
  }
}

export const DoTrSkimpy = DoTransferItems(TranferSkimpy(IsNotRegistered))
export const DoTrSkimpyI = DoTransferItems(TranferSkimpy(IsRegistered))
