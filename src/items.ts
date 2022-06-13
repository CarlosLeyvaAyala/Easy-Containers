import { Combinators as C, DebugLib, FormLib, Hotkeys } from "DMLib"
import * as JDB from "JContainers/JDB"
import * as JFormMap from "JContainers/JFormMap"
import { ArmorArg, IsNotRegistered, IsRegistered } from "skimpify-api"
import {
  Actor,
  Ammo,
  Armor,
  Book,
  Container,
  Debug,
  Form,
  Game,
  Ingredient,
  ObjectReference,
  Quest,
  Weapon,
} from "skyrimPlatform"
import { chestPath, itemsPath, LE, LI, LV, LVT, mcm } from "./shared"

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

/** Gets a memory database handle to a JContainers object, creating it if it doesn't exist. */
function GetDbHandle(): number {
  const r = JDB.solveObj(itemsPath)
  return r !== 0 ? r : JFormMap.object()
}

/** Saves a JContainers object handle to the memory database. */
function SaveDbHandle(h: number) {
  JDB.solveObjSetter(itemsPath, h, true)
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
 * Equipped and favorited items are not transferred.
 */
function DoTransferItems(IsInvalid: InvalidItemFunc, msg: string = "items") {
  return () =>
    ManageItems(
      `Transferring ${msg} to container.`,
      (c, h) => {
        const p = Game.getPlayer() as Actor
        let n = 0
        FormLib.ForEachItemR(p, (item) => {
          const Invalid = (_: FormNull) =>
            IsInvalid(item, h, c) || IsEquipOrFav(item, p)

          if (TransferItemByInvalid(item, p, c, Invalid)) n++
        })
        return `${n} types of items were transferred`
      },
      C.K("Select a valid container")
    )
}

/** Transfers items beween two containers. */
function TransferItemByInvalid(
  item: FormNull,
  from: ObjectReference,
  to: ObjectReference,
  IsInvalidItem: (i: FormNull) => boolean
) {
  if (IsInvalidItem(item)) return false
  from.removeItem(item, from.getItemCount(item), true, to)
  return true
}

/** Transfers items beween two containers. */
function TransferItem(
  item: FormNull,
  from: ObjectReference,
  to: ObjectReference,
  IsValid: (i: FormNull) => boolean
) {
  const valid = IsValid(item)
  if (valid) from.removeItem(item, from.getItemCount(item), true, to)
  return valid
}

// ;>========================================================
// ;>===                  BY CATEGORY                   ===<;
// ;>========================================================

type CategoryFunc = (i: FormNull) => boolean

export interface TransferFunctions {
  Transfer: Hotkeys.KeyPressEvt
  TransferInv: Hotkeys.KeyPressEvt
  TransferAll: Hotkeys.KeyPressEvt
}

const IsWeapon: CategoryFunc = (i: FormNull) => Weapon.from(i) !== null
const IsAmmo: CategoryFunc = (i: FormNull) => Ammo.from(i) !== null
const IsArmor: CategoryFunc = (i: FormNull) => Armor.from(i) !== null
const IsBook: CategoryFunc = (i: FormNull) => Book.from(i) !== null
const IsIngredient: CategoryFunc = (i: FormNull) => Ingredient.from(i) !== null

export namespace Category {
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

  function CreateTransferFuncs(
    IsWhat: CategoryFunc,
    msg: string
  ): TransferFunctions {
    return {
      Transfer: ByCat(IsWhat, msg),
      TransferInv: ByCatI(IsWhat, msg),
      TransferAll: ByCatAll(IsWhat, msg),
    }
  }

  export const Weapons = CreateTransferFuncs(IsWeapon, "weapons")
  export const Armors = CreateTransferFuncs(IsArmor, "armors")
  export const Ammos = CreateTransferFuncs(IsAmmo, "ammo")
  export const Books = CreateTransferFuncs(IsBook, "books")

  export const Marked: TransferFunctions = {
    /** Transfer only marked items. */
    Transfer: DoTransferItems(IsNotDbRegistered, "marked items"),
    /** Transfer only unmarked items. */
    TransferInv: DoTransferItems(IsDbRegistered, "unmarked items"),
    /** Transfers all non equipped/favorited items. */
    TransferAll: DoTransferItems((_) => false, "ALL items"),
  }

  export const Skimpy: TransferFunctions = {
    /** Transfer armors registered in the Skimpify Framework. */
    Transfer: DoTransferItems(TranferSkimpy(IsNotRegistered)),
    /** Transfer armors NOT registered in the Skimpify Framework. */
    TransferInv: DoTransferItems(TranferSkimpy(IsRegistered)),
    TransferAll: Hotkeys.DoNothing,
  }
}

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

/** Sell all marked items */
export function DoSell() {
  const p = Game.getPlayer() as Actor
  const h = GetDbHandle()
  let gold = 0
  let n = 0
  FormLib.ForEachItemR(p, (i) => {
    if (!i || IsNotDbRegistered(i, h) || IsEquipOrFav(i, p)) return
    const q = p.getItemCount(i)
    gold += i.getGoldValue() * q * mcm.sellingMultiplier
    p.removeItem(i, q, true, null)
    n += q
  })

  gold = Math.round(gold)
  p.addItem(Game.getFormEx(0xf), gold, true)
  Debug.messageBox(`${n} items were sold for ${gold}`)
}

export namespace Autocraft {
  const enum ChestType {
    ingredients = "ingredients",
  }
  /** Player is used as dummy Form so global chests FormIds can be saved to database */
  const Player = () => Game.getPlayer() as Actor

  namespace Base {
    const ChestPath = (chest: ChestType) => `${chestPath}.${chest}`

    function GetChestDbHandle(path: string) {
      const r = JDB.solveObj(path)
      return r !== 0 ? r : JFormMap.object()
    }

    function SaveChestDbHandle(h: number, path: string) {
      JDB.solveObjSetter(path, h, true)
    }

    function LogNoChestCreated(name: ChestType) {
      const msg =
        `Couldn't create the auto craft ${name} chest in Tamriel. ` +
        `Are you using a mod that substantially changes the game?`
      LE(msg)
    }

    /** Gets a permanent chest. Creates it if it doesn't exist. */
    export function GetChest(chest: ChestType) {
      const path = ChestPath(chest)
      const h = GetChestDbHandle(path)
      let frm = JFormMap.getForm(h, Player())

      if (!frm) {
        const newChest = FormLib.CreatePersistentChest()
        if (!newChest) return DebugLib.Log.R(LogNoChestCreated(chest), null)
        frm = Game.getFormEx(newChest)
        JFormMap.setForm(h, Player(), frm)
        SaveChestDbHandle(h, path)
      }

      return frm
    }
  }

  function LogNoChest(name: ChestType) {
    const msg = `Global auto crafting chest for ${name} couldn't be found. Contact the developer.`
    LE(msg)
  }

  export interface AutocraftFunctions {
    /** Function for sending from player to autocraft chest. */
    SendTo: Hotkeys.KeyPressEvt
    /** Function for sending from autocraft chest to player. */
    GetFrom: Hotkeys.KeyPressEvt
  }

  const BlankFunction = () => {}

  const Chest = (chest: ChestType) => () => {
    const c = ObjectReference.from(Base.GetChest(chest))
    if (!c) {
      LogNoChest(chest)
      return null
    }
    return c
  }

  type ObjFunc = () => ObjectReference | null

  const ExecuteTransfer =
    (from: ObjFunc, to: ObjFunc, IsValid: CategoryFunc) => () => {
      const f = from()
      const t = to()
      if (!f || !t) return

      FormLib.ForEachItemR(f, (item) => {
        TransferItem(item, f, t, IsValid)
      })
    }

  function CreateAutocraft(
    chest: ChestType,
    IsSomething: CategoryFunc
  ): AutocraftFunctions {
    const AllAreValid = () => true
    return {
      SendTo: ExecuteTransfer(Player, Chest(chest), IsSomething), // TODO: Test if item is quest locked
      GetFrom: ExecuteTransfer(Chest(chest), Player, AllAreValid),
    }
  }

  /** A Return To Your Roots */
  const TheBullshitQuest = () =>
    Quest.from(Game.getFormFromFile(0xc9ba0, "Skyrim.esm"))

  const IsCrimsonNirnroot = (i: FormNull) => i?.getFormID() === 0xb701a

  function IsAutoIngredient(i: FormNull): boolean {
    const is = IsIngredient(i)
    // return is
    if (!is) return false
    if (IsCrimsonNirnroot(i) && TheBullshitQuest()?.isActive()) return false
    return true
  }

  export const Ingredients = CreateAutocraft(
    ChestType.ingredients,
    IsAutoIngredient
  )
}
