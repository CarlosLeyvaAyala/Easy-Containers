import { Combinators as C, FormLib } from "DMLib"
import * as JDB from "JContainers/JDB"
import * as JFormMap from "JContainers/JFormMap"
import { ArmorArg, IsNotRegistered, IsRegistered } from "skimpify-api"
import {
  Actor,
  Ammo,
  Armor,
  Container,
  Debug,
  Form,
  Game,
  ObjectReference,
  Weapon,
} from "skyrimPlatform"
import { LI, LV, LVT, sellMult } from "./shared"

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
  const msgAfter =
    !cn || !Container.from(cn.getBaseObject())
      ? OnNoContainer(hd)
      : DoProcessing(cn, hd)

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

type DbHandle = number
type FormNull = Form | null

/** Is the item registered in the database? */
const IsDbRegistered = (i: FormNull, h: DbHandle) => JFormMap.hasKey(h, i)
/** Is the item not registered in the database? */
const IsNotDbRegistered = (i: FormNull, h: DbHandle) => !IsDbRegistered(i, h)

const IsEquipOrFav = (i: FormNull, a: Actor) =>
  a.isEquipped(i) || a.getEquippedObject(0) === i || Game.isObjectFavorited(i)

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
      return `${n} types of items were marked (${i} new)`
    },
    C.K("Select a valid container")
  )
}

type InvalidItemFunc = (
  item: FormNull,
  dbHandle: DbHandle,
  container: ObjectReference | null
) => boolean

/** Transfers all marked items in player inventory to the selected container in the crosshair.\
 * Equiped and favorited items are not transferred.
 */
function DoTransferItems(IsInvalid: InvalidItemFunc, msg: string = "items") {
  return () =>
    ManageItems(
      `Transferring ${msg} to container.`,
      (c, h) => {
        const p = Game.getPlayer() as Actor
        let n = 0
        FormLib.ForEachItemR(p, (item) => {
          if (IsInvalid(item, h, c) || IsEquipOrFav(item, p)) return

          p.removeItem(item, p.getItemCount(item), true, c) // Remove all items belonging to the marked type
          n++
        })
        return `${n} types of items were transferred`
      },
      C.K("Select a valid container")
    )
}

/** Transfers all non equipped/favorited items. */
export const DoTransferAll = DoTransferItems((_) => false, "ALL items")
/** Transfer only marked items. */
export const DoTransfer = DoTransferItems(IsNotDbRegistered, "marked items")
/** Transfer only unmarked items. */
export const DoTransferI = DoTransferItems(IsDbRegistered, "unmarked items")

// ;>========================================================
// ;>===                  BY CATEGORY                   ===<;
// ;>========================================================

type CategoryFunc = (i: FormNull) => boolean

/** Tell if an item belongs to some category and is registered in database */
function MarkedByCat(cat: CategoryFunc): InvalidItemFunc {
  return (i: FormNull, h: DbHandle) => {
    if (!cat(i)) return true
    return IsNotDbRegistered(i, h)
  }
}

function UnmarkedByCat(cat: CategoryFunc): InvalidItemFunc {
  return (i: FormNull, h: DbHandle) => {
    if (!cat(i)) return true
    return IsDbRegistered(i, h)
  }
}

/** Transfers items that belong to some category and are registered in database */
const ByCat = (cat: CategoryFunc, msg: string) =>
  DoTransferItems(MarkedByCat(cat), `marked ${msg}`)
/** Transfers items that belong to some category and are NOT registered in database */
const ByCatI = (cat: CategoryFunc, msg: string) =>
  DoTransferItems(UnmarkedByCat(cat), `unmarked ${msg}`)
/** Transfers items that belong to some category */
const ByCatAll = (cat: CategoryFunc, msg: string) =>
  DoTransferItems((i: FormNull) => !cat(i), `all ${msg}`)

const IsWeapon: CategoryFunc = (i: FormNull) =>
  (Weapon.from(i) || Ammo.from(i)) !== null
const IsArmor: CategoryFunc = (i: FormNull) => Armor.from(i) !== null

/** Transfer marked weapons. */
export const DoTransferWeapons = ByCat(IsWeapon, "weapons")
/** Transfer unmarked weapons. */
export const DoTransferWeaponsI = ByCatI(IsWeapon, "weapons")
/** Transfer all weapons. */
export const DoTransferWeaponsAll = ByCatAll(IsWeapon, "weapons")

/** Transfer marked armors. */
export const DoTransferArmor = ByCat(IsArmor, "armors")
/** Transfer unmarked armors. */
export const DoTransferArmorI = ByCatI(IsArmor, "armors")
/** Transfer all armors. */
export const DoTransferArmorAll = ByCatAll(IsArmor, "armors")

// ;>========================================================
// ;>===                    SPECIAL                     ===<;
// ;>========================================================

/** Checks if an armor is related to the Skimpify Framework */
function TranferSkimpy(f: (a: ArmorArg) => boolean) {
  return (i: FormNull) => {
    const aa = Armor.from(i)
    return !aa ? false : f(aa)
  }
}

/** Transfer armors registered in the Skimpify Framework. */
export const DoTrSkimpy = DoTransferItems(TranferSkimpy(IsNotRegistered))
/** Transfer armors NOT registered in the Skimpify Framework. */
export const DoTrSkimpyI = DoTransferItems(TranferSkimpy(IsRegistered))

/** Sell all marked items */
export function DoSell() {
  const p = Game.getPlayer() as Actor
  const h = GetDbHandle()
  let gold = 0
  let n = 0
  FormLib.ForEachItemR(p, (i) => {
    if (!i || IsNotDbRegistered(i, h) || IsEquipOrFav(i, p)) return
    const q = p.getItemCount(i)
    gold += i.getGoldValue() * q * sellMult
    p.removeItem(i, q, true, null)
    n += q
  })

  gold = Math.round(gold)
  p.addItem(Game.getFormEx(0xf), gold, true)
  Debug.messageBox(`${n} items were sold for ${gold}`)
}
