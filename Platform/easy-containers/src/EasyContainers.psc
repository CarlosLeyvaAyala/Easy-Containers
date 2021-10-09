Scriptname EasyContainers Hidden
{
  Not part of Max Sick Gains, but added here because the foundation to make this work was done there.

  ;FIXME: Move this to its own mod.
}

Function MarkItems() Global
  Debug.Notification("Marking items in container. May take a while.")
  ObjectReference containr = Game.GetCurrentCrosshairRef()
  If !containr
    return
  EndIf

  int items = _GetItems()
  int itemindex = containr.GetNumItems()

  While(itemindex > 0)
    itemindex -= 1
    _MarkItem(containr.GetNthForm(itemindex), items)
  EndWhile

  _SaveItems(items)
  Debug.MessageBox("All items were marked")
EndFunction

Function TransferItems() Global
  Debug.Notification("Transferring items to container. This will take a while.")
  ObjectReference containr = Game.GetCurrentCrosshairRef()
  If !containr
    return
  EndIf

  float t = Utility.GetCurrentRealTime()
  Actor player = Game.GetPlayer()
  int items = _GetItems()
  int itemindex = player.GetNumItems()

  While(itemindex > 0)
    itemindex -= 1
    _TransferItem(player.GetNthForm(itemindex), items, player, containr)
  EndWhile
  Debug.MessageBox("All items were transferred")
  MiscUtil.PrintConsole("Execution time: "+ (Utility.GetCurrentRealTime() - t))
EndFunction

; Tranfers an item to the seleced container
Function _TransferItem(Form item, int items, Actor player, ObjectReference containr) Global
  If !items || JArray.findForm(items, item) == -1 || player.IsEquipped(item) || player.GetEquippedObject(0) == item || Game.IsObjectFavorited(item)
    return
  EndIf
  player.RemoveItem(item, 999999, true, containr)
  ; player.RemoveItem(item, player.GetItemCount(item), false, containr)
EndFunction

; Marks a single item as transfereable.
Function _MarkItem(Form frm, int items) Global
  If JArray.findForm(items, frm) >= 0
    return    ; Don't add an already existing item
  EndIf
  JArray.addForm(items, frm)
  ; Debug.Notification(frm.GetName() + " was marked sucessfully")
EndFunction

; Gets the item database from memory. Creates one if it doesn't exist.
int Function _GetItems() Global
  int items = JDB.solveObj(".EasyContainers.items")
  If !items
    items = JArray.object()
  EndIf
  return items
EndFunction

; Saves the item database to memory.
Function _SaveItems(int items) Global
  JDB.solveObjSetter(".EasyContainers.items", items, true)
EndFunction
