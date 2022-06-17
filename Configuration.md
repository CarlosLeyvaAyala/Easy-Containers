# Configuration
The plugin can be configured in `Data\Platform\Plugins\easy-containers-settings.txt`.

Settings:
- `loggingLevel`: How much spam do you want in your Skyrim console?\
  Possible values:

  - `"none"`: No spam.
  - `"error"`: Just errors and stuff like that.
  - `"info"`: Detailed info so players can know if things are going as expected, but not enough for actual debugging.
  - `"verbose"`: Info meant for developers. Use it for reporting errors or unexpected behavior.

  You must use that word casing (double quotes included) as is, otherwise you'll get `"verbose"` level, no matter what.

# Hotkeys
See [Hotkeys][] for all things related to hotkey configuring.

remember all the following operations are done on the items inside the container at the game crosshair and will ignore equipped or favorited items.

- `inverse`: Will "invert" some operations when this key is pressed along the operations ones.\
    What that means depends on what operation was invoked.
  
| Hotkey name   | Operation                                                                                                                                            | Inverse                         |
|---------------|------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------|
| `sell`        | Sell all marked items in your inventory; selling price is multiplied by `sellingMultiplier` (50% by default). This won't give you Speech experience. | N/A                             |
| `mark`        | Marks all items.                                                                                                                                     | N/A                             |
| `transfer`    | Transfers all marked items from the player to the chest.                                                                                             | Transfers all unmarked items.   |
| `weapon`      | Transfers all marked weapons from the player to the chest.                                                                                           | Transfers all unmarked weapons. |
| `ammo`        | Transfers all marked ammo from the player to the chest.                                                                                              | Transfers all unmarked ammo.    |
| `armor`       | Transfers all marked armors from the player to the chest.                                                                                            | Transfers all unmarked armors.  |
<!-- - ``: Transfers all marked s from the player to the chest.
    - `inverse`: Transfers all unmarked s. -->

## "all" hotkeys

Hotkeys that contain the word `all` (`transferAll`, `allWeapons`...) will transfer all items of that category, regardless of items being maked or not.

## "auto" hotkeys


[Hotkeys]: https://github.com/CarlosLeyvaAyala/DM-Lib-Typescript/blob/main/Hotkeys.md