# Easy Containers
Skyrim mod for item management.\
Batch move unwanted items to any container.

## Usage
First you need to "mark" some items so this mod knows you want to get rid of them. 

- Put your unwanted items inside any container. 
- Make sure the game crosshair is over that container (the "Activate" message ***must*** be there). 
- Use "mark item" hotkey to remember those items. 
- If you get the message pop-up, your items will now be remembered. 

Those items are marked **forever**.\
If you want to add more to the Marked List, just put new items inside some container and mark them using the same steps above. 

Whenever you have Marked items in inventory, all of them will be moved to any container under the crosshair. 

- Put the crosshair over some container. 
- Press the "transfer" hotkey. 
- All Marked items will be transferred to that container. 

This mod will never transfer favorited or equipped items.

## Configuration
See [Configuration][] for more details.

## Hard requirements

You'll need these mods to make it work.

- [Skyrim Platform][]
- [JContainers][]

# Developing

## Dependencies

All player dependencies plus:

- [node.js][]
- [JContainers typescript definitions][Ts-Coversions]
- [DM-Lib-Typescript][]

## Building

Building steps are mostly the same as the example plugin from [Skyrim Platform][].

Since this plugin is also meant to serve as a guide to [Skyrim Platform][] newcomers (me included) I added the [first version of this plugin made in Papyrus][src].

You can compile and run that version to see how hilariously slow and clumsy is Papyrus compared to [Skyrim Platform][].

### Before  building

The less hassle-free way to develop plugins is to just put [Skyrim Platform][] files in the Skyrim Data folder.

Should be trivial if you use Vortex, but with MO that would mean folder pollution.\
Do it anyway, it's really the best way. 

### Building steps for beginners

1. Put Typescript [dependencies](#dependencies) in the folder where `skyrimPlatform.ts` is located (`<Skyrim Data path>\Platform\Modules`).

1. Install [node.js][].

1. Open the command line and navigate to [Platform/easy-containers/][].

1. Run `npm i` to install the dependencies.

1. Create a file `tsc/config.js` with the following contents:

   ```js
   module.exports = {
       // Change `seRoot` to the correct path to the Skyrim SE folder. The path should have slashes like this: `/` (not `\\`).
       seRoot: "C:/Program Files (x86)/Steam/steamapps/common/Skyrim Special Edition"
   };
   ```
   
1. You will likely want to have this project inside its own folder. \
Copy the file named `tsconfig-default.json` inside its own folder and rename it as `tsconfig.json`, then add both [`"rootDirs"`][rootdirs] and [`"baseUrl"`][baseUrl] entries to `tsconfig.json`.

    ```json
        ...
        "outFile": "../Plugins/easy-containers.js",

        // Notice how all of these are absolute paths
        "rootDirs": [

            // Folder where skyrimPlatform.ts is located 
            "<Skyrim Data path>\\Platform\\Modules",
            // Folder for this project
            "<Base path>\\Easy Containers-src\\Platform\\easy-containers"
        ],
        // Folder where skyrimPlatform.ts is located 
        "baseUrl": "<Skyrim Data path>\\Platform\\Modules",

        "lib": [
        "ES2015"
        ]
        ...
    ```

1. Run `npm run dev`.\
If everything is ok, the message `Found 0 errors, installing easy-containers.js` will appear.

1. Put the `easy-containers.js` [file][Plugins-Path] (generated by previous steps) inside `Data/Platform/Plugins/`, so Skyrim can actually recognize the plugin.

1. Log in to Steam and start the game with `skse64_loader.exe`.

If everything went alright, when opening the console you should see a message saying `"Easy Containers successfully initialized."`.

### Optional step 

Since I'm creating a [library][DM-Lib-Typescript] while developing plugins, I want to have easy access to it, so:

1. Create a **symbolic link** to DM-Lib in the same directory where `tsconfig.json` is. \
Use [Link Shell Extension][] for that.

You don't care about this step for building this project, but I do.

Just putting this as a reminder for myself on how to work.

[JContainers]: https://www.nexusmods.com/skyrimspecialedition/mods/16495

[Link Shell Extension]: https://schinagl.priv.at/nt/hardlinkshellext/hardlinkshellext.html#download

[node.js]: https://nodejs.org/

[Platform/easy-containers/]: Platform/easy-containers/

[Plugins-Path]: Platform/Plugins/

[Skyrim Platform]: https://www.nexusmods.com/skyrimspecialedition/mods/54909

[src]: Platform/easy-containers/src

[Ts-Coversions]: https://github.com/CarlosLeyvaAyala/Papyrus-2-Typescript/tree/main/conversions

[DM-Lib-Typescript]: https://github.com/CarlosLeyvaAyala/DM-Lib-Typescript

[rootdirs]: https://www.typescriptlang.org/tsconfig#rootDirs

[baseUrl]: https://www.typescriptlang.org/tsconfig#baseUrl

[DXScanCodes]: https://www.creationkit.com/index.php?title=Input_Script#DXScanCodes

[Hotkeys]: https://github.com/CarlosLeyvaAyala/DM-Lib-Typescript/blob/main/Hotkeys.md

[Configuration]: Configuration.md