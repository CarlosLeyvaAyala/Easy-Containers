// import { Combinators as C, Hotkeys } from "DMLib"
import { I, K } from "DmLib/Combinators"
import {
  forEachItemR,
  getFormFromUniqueId,
  getPersistentChest,
  getUniqueId,
} from "DmLib/Form"
import { DoNothing, KeyPressEvt } from "DmLib/hotkeys"
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
  Keyword,
  ObjectReference,
  Quest,
  Utility,
  Weapon,
} from "skyrimPlatform"
import { LE, LI, LV, LVT, chestPath, itemsPath, mcm } from "./shared"

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

export function ClearDb() {
  SaveDbHandle(JFormMap.object())
  Debug.messageBox("Easy Containers database was cleared")
}

type DbHandle = number
type FormNull = Form | null

/** Is the item registered in the database? */
const IsDbRegistered = (i: FormNull, h: DbHandle) => JFormMap.hasKey(h, i)
/** Is the item not registered in the database? */
const IsNotDbRegistered = (i: FormNull, h: DbHandle) => !IsDbRegistered(i, h)

const IsEquipOrFavOrNonPlayable = (i: FormNull, a: Actor) =>
  a.isEquipped(i) ||
  a.getEquippedObject(0) === i ||
  Game.isObjectFavorited(i) ||
  !i?.isPlayable()

/**
 * (Un)marks items inside some container.
 * @param opDesc What the `notification` will tell the player.
 * @param LogExist What to log if the item exists in the database.
 * @param StopCondition When not to process an item existing in database.
 * @param DbManipulate What to do with the item that will be processed.
 * @param LogSuccess Whan to log in case the item was processed.
 * @param ResultMsg What the `messagebox` will tell the player.
 */
function UnMarkItems(
  opDesc: string,
  LogExist: (itemName: string) => string,
  StopCondition: (exsits: boolean) => boolean,
  DbManipulate: (handle: number, item: Form) => void,
  LogSuccess: (itemName: string) => string,
  ResultMsg: (totalItems: number, processedItems: number) => string
) {
  ManageItems(
    opDesc,
    (c, h) => {
      let n = 0
      let i = 0
      forEachItemR(c, (item) => {
        if (!item) return
        const iN = item.getName()
        const name = iN !== "" ? iN : getUniqueId(item)
        const exists = LVT(LogExist(name), JFormMap.hasKey(h, item))

        n++
        if (StopCondition(exists)) return
        DbManipulate(h, item)
        i++
        LI(LogSuccess(name))
      })

      SaveDbHandle(h)
      return ResultMsg(n, i)
    },
    K("Select a valid container")
  )
}

/** Marks all items in some container. */
export function DoMarkItems() {
  UnMarkItems(
    "Marking items inside container.",
    (name) => `Trying to add ${name} to database. Already added?`,
    I,
    (h, item) => JFormMap.setInt(h, item, 0), // `value` is irrelevant; we only want the `key` (item) to be added
    (name) => `${name} was added to database`,
    (n, i) => `${n} types of items were marked (${i} new)`
  )
}

export function DoUnmarkItems() {
  UnMarkItems(
    "Unmarking items inside container.",
    (name) => `Trying to remove ${name} from database. Already added?`,
    (e) => !e,
    (h, item) => JFormMap.removeKey(h, item),
    (name) => `${name} was removed from database`,
    (_, i) => `${i} types of items were unmarked`
  )
}

export const Marking: TransferFunctions = {
  Transfer: DoMarkItems,
  TransferInv: DoUnmarkItems,
  TransferAll: DoNothing,
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
        forEachItemR(p, (item) => {
          const Invalid = (_: FormNull) =>
            IsInvalid(item, h, c) || IsEquipOrFavOrNonPlayable(item, p)

          if (TransferItemByInvalid(item, p, c, Invalid)) n++
        })
        return `${n} types of items were transferred`
      },
      K("Select a valid container")
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
  Transfer: KeyPressEvt
  TransferInv: KeyPressEvt
  TransferAll: KeyPressEvt
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

  export const Transfer: TransferFunctions = {
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
    TransferAll: DoNothing,
  }
}

// ;>========================================================
// ;>===                    SPECIAL                     ===<;
// ;>========================================================

/** Checks if an armor is related to the Skimpify Framework */
function TranferSkimpy(f: (a: ArmorArg) => boolean) {
  return (i: FormNull) => {
    const aa = Armor.from(i)
    return !aa ? true : f(aa)
  }
}

/** Sell all marked items */
export function DoSell() {
  const p = Game.getPlayer() as Actor
  const h = GetDbHandle()
  let gold = 0
  let n = 0
  forEachItemR(p, (i) => {
    if (!i || IsNotDbRegistered(i, h) || IsEquipOrFavOrNonPlayable(i, p)) return
    const q = p.getItemCount(i)
    gold += i.getGoldValue() * q * mcm.sellingMultiplier
    p.removeItem(i, q, true, null)
    n += q
  })

  gold = Math.round(gold)
  p.addItem(Game.getFormEx(0xf), gold, true)
  //   let g = p.getItemCount(Game.getFormEx(0xf))
  //   LA(g.toString())
  //   p.addItem(Game.getFormEx(0xf), g + gold, true)
  Debug.messageBox(`${n} items were sold for ${gold}`)
}

export namespace Autocraft {
  export namespace Checking {
    const uIdToForm = (f: string) => getFormFromUniqueId(f)
    const IsForm = (item: Form, forms: (Form | null)[]) =>
      forms.filter((v) => item.getFormID() === v?.getFormID()).length > 0
    const HasKeyword = (item: Form, keys: (Form | null)[]) =>
      keys.filter((k) => item.hasKeyword(Keyword.from(k))).length > 0

    /** Checks if an item is from autocraft as defined in config */
    export function FromConfig(
      keywords: string[],
      forms: string[],
      exceptions: string[]
    ) {
      return () => {
        const fms = forms.map(uIdToForm)
        const ks = keywords.map(uIdToForm)
        const ex = exceptions.map(uIdToForm)
        return (i: FormNull): boolean => {
          if (!i || IsForm(i, ex)) return false
          if (IsForm(i, fms) || HasKeyword(i, ks)) return true
          return false
        }
      }
    }

    /** Checks if an item is a valid soul gem */
    export function IsSoulGem() {
      return () => {
        const e = mcm.autocrafting.enchanting
        const fill = e.filled.map(uIdToForm)
        const empty = e.empty.map(uIdToForm)
        const except = e.exceptions.map(uIdToForm)

        return (i: FormNull): boolean => {
          if (!i || IsForm(i, except)) return false
          if (IsForm(i, fill)) return e.storeFilled
          if (IsForm(i, empty)) return e.storeEmpty
          return false
        }
      }
    }
  }

  const enum ChestType {
    ingredients = "ingredients",
    smithing = "smithing",
    enchanting = "enchanting",
    home = "home",
    autoAll = "autoAll",
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
      const fmt = `Error with auto craft ${name} chest: `
      return (msg: string) => LE(`${fmt} ${msg}`)
    }

    /** Gets a permanent chest. Creates it if it doesn't exist. */
    export function GetChest(chest: ChestType) {
      const path = ChestPath(chest)
      const h = GetChestDbHandle(path)

      const Getter = () => {
        return JFormMap.getForm(h, Player())
      }
      const Setter = (frm: Form | null) => {
        JFormMap.setForm(h, Player(), frm)
        SaveChestDbHandle(h, path)
      }
      return getPersistentChest(Getter, Setter, LogNoChestCreated(chest))
    }
  }

  function LogNoChest(name: ChestType) {
    const msg = `Global auto crafting chest for ${name} couldn't be found. Contact the developer.`
    LE(msg)
  }

  export interface AutocraftFunctions {
    /** Function for sending from player to autocraft chest. */
    SendTo: KeyPressEvt
    /** Function for sending from autocraft chest to player. */
    GetFrom: KeyPressEvt
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

  function OpenChest(C: ObjFunc) {
    return () => {
      const container = C()
      if (!container) return
      container.activate(Game.getPlayer(), true)
    }
  }

  const ExecuteTransfer =
    (from: ObjFunc, to: ObjFunc, IsValid: CategoryFunc, msg: string = "") =>
    () => {
      const f = from()
      const t = to()
      if (!f || !t) return
      const IsV = (i: FormNull) =>
        !Armor.from(i) && !Weapon.from(i) && IsValid(i)

      forEachItemR(f, (item) => {
        TransferItem(item, f, t, IsV)
      })
      if (msg) Debug.notification(msg)
    }

  /** Made to deal with the fact that Game functions can only be called in some
   * specific contexts.
   */
  const ExecuteTransferLazy =
    (from: ObjFunc, to: ObjFunc, IsValid: () => CategoryFunc, msg: string) =>
    () => {
      const IsV = IsValid()
      ExecuteTransfer(from, to, IsV, msg)()
    }

  const SentMsg = (msg: string) => `All ${msg} were stored successfully.`
  const GetMsg = (msg: string) => `All ${msg} were retrieved successfully.`

  type IsFunction = {
    kind: "direct"
    execute: CategoryFunc
  }

  /** Deals with the fact that Game functions can only be called in some specific contexts. */
  type IsFunctionLazy = {
    kind: "lazy"
    lazy: () => CategoryFunc
  }

  type IdentityFunc = IsFunction | IsFunctionLazy

  function CreateAutocraft(
    chest: ChestType,
    IsSomething: IdentityFunc,
    msg: string
  ): AutocraftFunctions {
    const P = Player
    const C = Chest(chest)
    const Send =
      IsSomething.kind === "direct"
        ? ExecuteTransfer(P, C, IsSomething.execute, SentMsg(msg))
        : ExecuteTransferLazy(P, C, IsSomething.lazy, SentMsg(msg))
    return {
      SendTo: Send, // TODO: Test if item is quest locked
      GetFrom: OpenChest(C), //ExecuteTransfer(C, P, AllAreValid, GetMsg(msg)),
    }
  }

  /** A Return To Your Roots */
  const TheBullshitQuest = () =>
    Quest.from(Game.getFormFromFile(0xc9ba0, "Skyrim.esm"))

  const IsCrimsonNirnroot = (i: FormNull) => i?.getFormID() === 0xb701a

  function IsAutoIngredient(i: FormNull): boolean {
    if (!IsIngredient(i)) return false
    if (IsCrimsonNirnroot(i) && TheBullshitQuest()?.isActive()) return false
    return true
  }

  export const Ingredients = CreateAutocraft(
    ChestType.ingredients,
    { kind: "direct", execute: IsAutoIngredient },
    "ingredients"
  )

  export const Enchanting = CreateAutocraft(
    ChestType.enchanting,
    { kind: "lazy", lazy: Checking.IsSoulGem() },
    "soul gems"
  )

  const s = mcm.autocrafting.smithing
  export const Smithing = CreateAutocraft(
    ChestType.smithing,
    {
      kind: "lazy",
      lazy: Checking.FromConfig(s.keywords, s.forms, s.exceptions),
    },
    "smithing items"
  )

  const h = mcm.autocrafting.home
  export const Home = CreateAutocraft(
    ChestType.home,
    {
      kind: "lazy",
      lazy: Checking.FromConfig(h.keywords, h.forms, h.exceptions),
    },
    "building items"
  )

  // const t = mcm.waitAutoAll

  export const All: AutocraftFunctions = {
    SendTo: () => {
      // Need to wait because this makes UIExtensions to go slow if not waiting between transfers
      const Fs = [
        Ingredients.SendTo,
        Enchanting.SendTo,
        Smithing.SendTo,
        Home.SendTo,
      ]
      const f = async () => {
        for (var i = 0; i < Fs.length; i++) {
          Fs[i]()
          await Utility.wait(mcm.waitAutoAll)
        }
        Debug.notification("All items were stored")
      }
      f()
    },
    GetFrom: () => {
      const AllAreValid = () => true

      const C = Chest(ChestType.autoAll)
      ExecuteTransfer(Chest(ChestType.enchanting), C, AllAreValid)()
      ExecuteTransfer(Chest(ChestType.home), C, AllAreValid)()
      ExecuteTransfer(Chest(ChestType.ingredients), C, AllAreValid)()
      ExecuteTransfer(Chest(ChestType.smithing), C, AllAreValid)()
      C()?.activate(Game.getPlayer(), true)
      // ExecuteTransfer(C, Chest(ChestType.ingredients), IsAutoIngredient)
    },
  }
}
