/* eslint-disable @typescript-eslint/adjacent-overload-signatures */
/* eslint-disable @typescript-eslint/no-namespace */
// Generated automatically. Do not edit.
System.register("skyrimPlatform", [], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
/**
 * Module for Hotkey related functions.
 */
System.register("DM-Lib/Hotkeys", ["skyrimPlatform"], function (exports_2, context_2) {
    "use strict";
    var skyrimPlatform_1, DoNothing, DoNothingOnHold, LogPress, LogRelease, LogHold;
    var __moduleName = context_2 && context_2.id;
    /**
     * Listens for some Hotkey press / release / hold.
     *
     * @see {@link https://www.creationkit.com/index.php?title=Input_Script#DXScanCodes | DXScanCodes}
     * for possible hotkey values.
     *
     * @remarks
     * Use this ***only inside an `'update'` event***.
     *
     * @param hk The hotkey to listen for.
     *
     * @returns A function that accepts three callbacks:
     * 1. OnKeyPress
     * 1. OnKeyReleased
     * 1. OnKeyHold - This one gets how many frames has the key being held
     *
     * @example
     * const LogPress = () => { printConsole(`Key was pressed`) }
     *
     * const LogRelease = () => { printConsole(`Key was released`) }
     *
     * const LogHold: KeyHoldEvt = n => () => { printConsole(`Key has been held for ${n} frames.`) }
     *
     * const DoStuff = ListenTo(76)           // Listen to num5
     * const OnlyCareForHold = ListenTo(77)   // Listen to num6
     *
     * on('update', () => {
     *   DoStuff(LogPress, LogRelease, LogHold)
     *   OnlyCareForHold(undefined, undefined, LogHold)
     * })
     */
    function ListenTo(hk) {
        var old = false;
        var frames = 0;
        return function (OnPress, OnRelease, OnHold) {
            if (OnPress === void 0) { OnPress = DoNothing; }
            if (OnRelease === void 0) { OnRelease = DoNothing; }
            if (OnHold === void 0) { OnHold = DoNothingOnHold; }
            var p = skyrimPlatform_1.Input.isKeyPressed(hk);
            if (old !== p) {
                frames = 0;
                if (p)
                    skyrimPlatform_1.once("update", OnPress);
                else
                    skyrimPlatform_1.once("update", OnRelease);
            }
            else if (p) {
                frames++;
                skyrimPlatform_1.once("update", OnHold(frames));
            }
            old = p;
        };
    }
    exports_2("ListenTo", ListenTo);
    return {
        setters: [
            function (skyrimPlatform_1_1) {
                skyrimPlatform_1 = skyrimPlatform_1_1;
            }
        ],
        execute: function () {
            exports_2("DoNothing", DoNothing = function () { });
            exports_2("DoNothingOnHold", DoNothingOnHold = function (_) { return function () { }; });
            /** Not an useful function. Use it as a template. @see {@link ListenTo} */
            exports_2("LogPress", LogPress = function () {
                skyrimPlatform_1.printConsole("Key was pressed");
            });
            /** Not an useful function. Use it as a template. @see {@link ListenTo} */
            exports_2("LogRelease", LogRelease = function () {
                skyrimPlatform_1.printConsole("Key was released");
            });
            /** Not an useful function. Use it as a template. @see {@link ListenTo} */
            exports_2("LogHold", LogHold = function (n) { return function () {
                skyrimPlatform_1.printConsole("Key has been held for " + n + " frames.");
            }; });
        }
    };
});
System.register("DM-Lib/Debug", ["skyrimPlatform"], function (exports_3, context_3) {
    "use strict";
    var skyrimPlatform_2, LoggingLevel;
    var __moduleName = context_3 && context_3.id;
    /** Creates a logging function that will log the mod's name and message when the log level is correct.
     * @returns A function that logs a message to the console.
     *
     * @remarks
     * Levels with negative numbers will only be displayed when the current logging level is exactly their value,
     * while positive numbers will get displayed when the current logging level is at least their value.
     * @see {@link LoggingLevel}
     *
     * @example
     * const modName = "Meh"
     * const currLogLvl = LoggingLevel.Info
     * const CLF = (logAt: LoggingLevel) => CreateLoggingFunction(modName, currLogLvl, logAt)
     * const LogO = CLF(LoggingLevel.Optimization)
     * const LogE = CLF(LoggingLevel.Error)
     * const LogI = CLF(LoggingLevel.Info)
     * const LogV = CLF(LoggingLevel.Verbose)
     *
     * LogO("Meh")              // ""
     * LogI("Mi mi mi mi mi")   // "[Meh] Mi mi mi mi mi"
     * LogV("Meh!")             // "[Meh] Meh!"
     */
    function CreateLoggingFunction(modName, currLogLvl, logAt) {
        return function (msg) {
            var m = "[" + modName + "] " + msg;
            if (currLogLvl >= logAt || (currLogLvl < 0 && currLogLvl === logAt))
                skyrimPlatform_2.printConsole(m);
        };
    }
    exports_3("CreateLoggingFunction", CreateLoggingFunction);
    /**
     * Makes a logging function to log a value, then returns that value.
     * @param f - The logging function.
     * @returns `function <T>(msg: string, x: T): T`
     *
     * @remarks
     * This function is intended to be used to initialize variables while logging them at the same time.
     */
    function TapLog(f) {
        return function (msg, x) {
            f(msg + ": " + x);
            return x;
        };
    }
    exports_3("TapLog", TapLog);
    /** @deprecated
     * Logs a message to the console with some value. Returns that value.
     *
     * @param msg - Message to log.
     * @param x - Value to append to `msg` separated by one space. If `null`, no attempt to log `x` will be made.
     * Only `msg` will be logged.
     *
     * why there's the awkward `null` second argument when you want to log only a message.
     *
     * @example
     * const x = Log("Initialized as:", SomeValueGotFromAFunction()) // -> "Initialized as: external value"
     * Log("This value doesn't need to be saved:", "meh") // -> "This value doesn't need to be saved: meh"
     * Log("Logged just a message", null) // -> "Logged just a message"
     */
    function Log(msg, x) {
        if (x)
            skyrimPlatform_2.printConsole(msg + " " + x);
        else
            skyrimPlatform_2.printConsole(msg);
        return x;
    }
    exports_3("Log", Log);
    /** @experimental
     * Measures the time it takes a function to execute and log it to console.
     *
     * @remarks
     * `Utility.getCurrentRealTime()` seems to be returning the same value for both
     * times the function starts and ends.\
     * I suspect this is because most functions in Skyrim Platform don't wait for the others to end.
     *
     * @param f - Function to measure.
     */
    function Benchmark(f) {
        return function () {
            var t1 = Log(f.name + " start time", skyrimPlatform_2.Utility.getCurrentRealTime());
            f();
            var t2 = Log(f.name + " end time", skyrimPlatform_2.Utility.getCurrentRealTime());
            Log("Execution time for " + f.name + ": ", t2 - t1);
        };
    }
    exports_3("Benchmark", Benchmark);
    return {
        setters: [
            function (skyrimPlatform_2_1) {
                skyrimPlatform_2 = skyrimPlatform_2_1;
            }
        ],
        execute: function () {
            /** How much will the console be spammed.
             * - Optimization - Meant to only output the times functions take to execute. Used for bottleneck solving.
             * - None
             * - Error - Just errors
             * - Info - Detailed info so the players can know if things are going as expected, but not enough for actual debugging.
             * - Verbose - Info meant for developers.
             */
            (function (LoggingLevel) {
                LoggingLevel[LoggingLevel["Optimization"] = -1] = "Optimization";
                LoggingLevel[LoggingLevel["None"] = 0] = "None";
                LoggingLevel[LoggingLevel["Error"] = 1] = "Error";
                LoggingLevel[LoggingLevel["Info"] = 2] = "Info";
                LoggingLevel[LoggingLevel["Verbose"] = 3] = "Verbose";
            })(LoggingLevel || (LoggingLevel = {}));
            exports_3("LoggingLevel", LoggingLevel);
        }
    };
});
System.register("DM-Lib/Iteration", [], function (exports_4, context_4) {
    "use strict";
    var __moduleName = context_4 && context_4.id;
    /**
     * Iterates over all items belonging to some `ObjectReference`, from last to first.
     * @param o - The object reference to iterate over.
     * @param f - Function applied over each item.
     */
    function ForEachItemR(o, f) {
        var i = o.getNumItems();
        while (i > 0) {
            i--;
            f(o.getNthForm(i));
        }
    }
    exports_4("ForEachItemR", ForEachItemR);
    return {
        setters: [],
        execute: function () {
        }
    };
});
/*
This file was automatically generated by Papyrus-2-Typescript.exe
https://github.com/CarlosLeyvaAyala/Papyrus-2-Typescript

The program has no way to know the intention of the humans that made
the scripts, so it's always advisable to manually check all generated
files to make sure everything is declared as it should.

Take note the program assumes this script exists in some subfolder
to the folder where `skyrimPlatform.ts` is found, otherwise you'll get
"Cannot find module..." type of errors.

If you want to have this script in some other place, just change the
relative path of each `import`.
*/
System.register("JContainers/JFormMap", ["skyrimPlatform"], function (exports_5, context_5) {
    "use strict";
    var sp, sn, object, getInt, getFlt, getStr, getObj, getForm, setInt, setFlt, setStr, setObj, setForm, hasKey, valueType, allKeys, allKeysPArray, allValues, removeKey, count, clear, addPairs, nextKey, getNthKey;
    var __moduleName = context_5 && context_5.id;
    return {
        setters: [
            function (sp_1) {
                sp = sp_1;
            }
        ],
        execute: function () {
            /** Associative key-value container.
                Inherits JValue functionality */
            sn = sp.JFormMap;
            /** creates new container object. returns container's identifier (unique integer number). */
            exports_5("object", object = function () { return sn.object(); });
            /** Returns the value associated with the @key. If not, returns @default value */
            exports_5("getInt", getInt = function (object, key, defaultVal) {
                if (defaultVal === void 0) { defaultVal = 0; }
                return sn.getInt(object, key, defaultVal);
            });
            exports_5("getFlt", getFlt = function (object, key, defaultVal) {
                if (defaultVal === void 0) { defaultVal = 0.0; }
                return sn.getFlt(object, key, defaultVal);
            });
            exports_5("getStr", getStr = function (object, key, defaultVal) {
                if (defaultVal === void 0) { defaultVal = ""; }
                return sn.getStr(object, key, defaultVal);
            });
            exports_5("getObj", getObj = function (object, key, defaultVal) {
                if (defaultVal === void 0) { defaultVal = 0; }
                return sn.getObj(object, key, defaultVal);
            });
            exports_5("getForm", getForm = function (object, key, defaultVal) {
                if (defaultVal === void 0) { defaultVal = null; }
                return sn.getForm(object, key, defaultVal);
            });
            /** Inserts @key: @value pair. Replaces existing pair with the same @key */
            exports_5("setInt", setInt = function (object, key, value) { return sn.setInt(object, key, value); });
            exports_5("setFlt", setFlt = function (object, key, value) { return sn.setFlt(object, key, value); });
            exports_5("setStr", setStr = function (object, key, value) { return sn.setStr(object, key, value); });
            exports_5("setObj", setObj = function (object, key, container) { return sn.setObj(object, key, container); });
            exports_5("setForm", setForm = function (object, key, value) { return sn.setForm(object, key, value); });
            /** Returns true, if the container has @key: value pair */
            exports_5("hasKey", hasKey = function (object, key) { return sn.hasKey(object, key); });
            /** Returns type of the value associated with the @key.
                0 - no value, 1 - none, 2 - int, 3 - float, 4 - form, 5 - object, 6 - string */
            exports_5("valueType", valueType = function (object, key) { return sn.valueType(object, key); });
            /** Returns a new array containing all keys */
            exports_5("allKeys", allKeys = function (object) { return sn.allKeys(object); });
            exports_5("allKeysPArray", allKeysPArray = function (object) { return sn.allKeysPArray(object); });
            /** Returns a new array containing all values */
            exports_5("allValues", allValues = function (object) { return sn.allValues(object); });
            /** Removes the pair from the container where the key equals to the @key */
            exports_5("removeKey", removeKey = function (object, key) { return sn.removeKey(object, key); });
            /** Returns count of pairs in the conainer */
            exports_5("count", count = function (object) { return sn.count(object); });
            /** Removes all pairs from the container */
            exports_5("clear", clear = function (object) { return sn.clear(object); });
            /** Inserts key-value pairs from the source container */
            exports_5("addPairs", addPairs = function (object, source, overrideDuplicates) { return sn.addPairs(object, source, overrideDuplicates); });
            /** Simplifies iteration over container's contents.
                Accepts the @previousKey, returns the next key.
                If @previousKey == @endKey the function returns the first key.
                The function always returns so-called 'valid' keys (the ones != @endKey).
                The function returns @endKey ('invalid' key) only once to signal that iteration has reached its end.
                In most cases, if the map doesn't contain an invalid key ("" for JMap, None form-key for JFormMap)
                it's ok to omit the @endKey.
                
                Usage:
                
                    string key = JMap.nextKey(map, previousKey="", endKey="")
                    while key != ""
                      <retrieve values here>
                      key = JMap.nextKey(map, key, endKey="")
                    endwhile */
            exports_5("nextKey", nextKey = function (object, previousKey, endKey) {
                if (previousKey === void 0) { previousKey = null; }
                if (endKey === void 0) { endKey = null; }
                return sn.nextKey(object, previousKey, endKey);
            });
            /** Retrieves N-th key. negative index accesses items from the end of container counting backwards.
                Worst complexity is O(n/2) */
            exports_5("getNthKey", getNthKey = function (object, keyIndex) { return sn.getNthKey(object, keyIndex); });
        }
    };
});
/*
This file was automatically generated by Papyrus-2-Typescript.exe
https://github.com/CarlosLeyvaAyala/Papyrus-2-Typescript

The program has no way to know the intention of the humans that made
the scripts, so it's always advisable to manually check all generated
files to make sure everything is declared as it should.

Take note the program assumes this script exists in some subfolder
to the folder where `skyrimPlatform.ts` is found, otherwise you'll get
"Cannot find module..." type of errors.

If you want to have this script in some other place, just change the
relative path of each `import`.
*/
System.register("JContainers/JDB", ["skyrimPlatform"], function (exports_6, context_6) {
    "use strict";
    var sp, sn, solveFlt, solveInt, solveStr, solveObj, solveForm, solveFltSetter, solveIntSetter, solveStrSetter, solveObjSetter, solveFormSetter, setObj, hasPath, allKeys, allValues, writeToFile, root;
    var __moduleName = context_6 && context_6.id;
    return {
        setters: [
            function (sp_2) {
                sp = sp_2;
            }
        ],
        execute: function () {
            /** Global entry point to store mod information. Main intent - replace global variables
                Manages keys and values associations (like JMap) */
            sn = sp.JDB;
            /** Attempts to retrieve the value associated with the @path.
                For ex. the following information associated with 'frosfall' key:
                
                "frostfall" : {
                    "exposureRate" : 0.5,
                    "arrayC" : ["stringValue", 1.5, 10, 1.14]
                }
                
                then JDB.solveFlt(".frostfall.exposureRate") will return 0.5 and
                JDB.solveObj(".frostfall.arrayC") will return the array containing ["stringValue", 1.5, 10, 1.14] values */
            exports_6("solveFlt", solveFlt = function (path, defaultVal) {
                if (defaultVal === void 0) { defaultVal = 0.0; }
                return sn.solveFlt(path, defaultVal);
            });
            exports_6("solveInt", solveInt = function (path, defaultVal) {
                if (defaultVal === void 0) { defaultVal = 0; }
                return sn.solveInt(path, defaultVal);
            });
            exports_6("solveStr", solveStr = function (path, defaultVal) {
                if (defaultVal === void 0) { defaultVal = ""; }
                return sn.solveStr(path, defaultVal);
            });
            exports_6("solveObj", solveObj = function (path, defaultVal) {
                if (defaultVal === void 0) { defaultVal = 0; }
                return sn.solveObj(path, defaultVal);
            });
            exports_6("solveForm", solveForm = function (path, defaultVal) {
                if (defaultVal === void 0) { defaultVal = null; }
                return sn.solveForm(path, defaultVal);
            });
            /** Attempts to assign the @value. Returns false if no such path.
                If 'createMissingKeys=true' it creates any missing path elements: JDB.solveIntSetter(".frostfall.keyB", 10, true) creates {frostfall: {keyB: 10}} structure */
            exports_6("solveFltSetter", solveFltSetter = function (path, value, createMissingKeys) {
                if (createMissingKeys === void 0) { createMissingKeys = false; }
                return sn.solveFltSetter(path, value, createMissingKeys);
            });
            exports_6("solveIntSetter", solveIntSetter = function (path, value, createMissingKeys) {
                if (createMissingKeys === void 0) { createMissingKeys = false; }
                return sn.solveIntSetter(path, value, createMissingKeys);
            });
            exports_6("solveStrSetter", solveStrSetter = function (path, value, createMissingKeys) {
                if (createMissingKeys === void 0) { createMissingKeys = false; }
                return sn.solveStrSetter(path, value, createMissingKeys);
            });
            exports_6("solveObjSetter", solveObjSetter = function (path, value, createMissingKeys) {
                if (createMissingKeys === void 0) { createMissingKeys = false; }
                return sn.solveObjSetter(path, value, createMissingKeys);
            });
            exports_6("solveFormSetter", solveFormSetter = function (path, value, createMissingKeys) {
                if (createMissingKeys === void 0) { createMissingKeys = false; }
                return sn.solveFormSetter(path, value, createMissingKeys);
            });
            /** Associates(and replaces previous association) container object with a string key.
                destroys association if object is zero
                for ex. JDB.setObj("frostfall", frostFallInformation) will associate 'frostall' key and frostFallInformation so you can access it later */
            exports_6("setObj", setObj = function (key, object) { return sn.setObj(key, object); });
            /** Returns true, if JDB capable resolve given @path, i.e. if it able to execute solve* or solver*Setter functions successfully */
            exports_6("hasPath", hasPath = function (path) { return sn.hasPath(path); });
            /** returns new array containing all JDB keys */
            exports_6("allKeys", allKeys = function () { return sn.allKeys(); });
            /** returns new array containing all containers associated with JDB */
            exports_6("allValues", allValues = function () { return sn.allValues(); });
            /** writes storage data into JSON file at given path */
            exports_6("writeToFile", writeToFile = function (path) { return sn.writeToFile(path); });
            /** Returns underlying JDB's container - an instance of JMap.
                The object being owned (retained) internally, so you don't have to (but can) retain or release it. */
            exports_6("root", root = function () { return sn.root(); });
        }
    };
});
System.register("src/entry", ["skyrimPlatform", "DM-Lib/Hotkeys", "DM-Lib/Debug", "DM-Lib/Iteration", "JContainers/JFormMap", "JContainers/JDB"], function (exports_7, context_7) {
    "use strict";
    var skyrimPlatform_3, Hotkey, D, Iteration_1, JFormMap, JDB;
    var __moduleName = context_7 && context_7.id;
    function main() {
        var modName = "Easy Containers";
        // TODO: Make configurable
        /** Current logging level. */
        var currLogLvl = D.LoggingLevel.Verbose;
        // Generates a logging function specific to this mod.
        var CLF = function (logAt) {
            return D.CreateLoggingFunction(modName, currLogLvl, logAt);
        };
        /** Logs messages intended to detect bottlenecks. */
        var LogO = CLF(D.LoggingLevel.Optimization);
        /** Logs an error message. */
        var LogE = CLF(D.LoggingLevel.Error);
        /** Logs detailed info meant for players to see. */
        var LogI = CLF(D.LoggingLevel.Info);
        /** Logs detailed info meant only for debugging. */
        var LogV = CLF(D.LoggingLevel.Verbose);
        /** Logs a variable while initializing it. Message level: info. */
        var LogIT = D.TapLog(LogI);
        /** Logs a variable while initializing it. Message level: verbose. */
        var LogVT = D.TapLog(LogV);
        /** Where the marked items database is located. */
        var basePath = ".EasyContainers.items";
        /** Gets a memory database handle to a JContainers object, creating it if it doesn't exist. */
        function GetDbHandle() {
            var r = JDB.solveObj(basePath);
            return r !== 0 ? r : JFormMap.object();
        }
        /** Saves a JContainers object handle to the memory database. */
        function SaveDbHandle(h) {
            JDB.solveObjSetter(basePath, h, true);
        }
        /** Marks all items in some container. */
        function DoMarkItems() {
            var container = skyrimPlatform_3.Game.getCurrentCrosshairRef();
            if (!container)
                return;
            skyrimPlatform_3.Debug.notification("Marking items in container.");
            var a = LogVT("Mark. Database handle", GetDbHandle());
            Iteration_1.ForEachItemR(container, function (item) {
                var name = item === null || item === void 0 ? void 0 : item.getName();
                var exists = LogVT("Trying to add " + name + " to database. Already added?", JFormMap.hasKey(a, item));
                if (exists)
                    return;
                JFormMap.setInt(a, item, 0); // `value` is irrelevant; we only want the `key` (item) to be added
                LogI(name + " was added to database");
            });
            SaveDbHandle(a);
            skyrimPlatform_3.Debug.messageBox("All items were marked");
        }
        /** Transfers all marked items in player inventory to the selected container in the crosshair.\
         * Equiped and favorited items are not transferred.
         */
        function DoTransferItems() {
            var container = skyrimPlatform_3.Game.getCurrentCrosshairRef();
            if (!container)
                return;
            skyrimPlatform_3.Debug.notification("Transferring items to container.");
            var p = skyrimPlatform_3.Game.getPlayer();
            var a = LogVT("Transfer. Database handle", GetDbHandle());
            var n = 0;
            Iteration_1.ForEachItemR(p, function (item) {
                if (!JFormMap.hasKey(a, item) ||
                    p.isEquipped(item) ||
                    p.getEquippedObject(0) === item ||
                    skyrimPlatform_3.Game.isObjectFavorited(item))
                    return;
                p.removeItem(item, 999999, true, container); // Remove all items belonging to the marked type
                n++;
            });
            skyrimPlatform_3.Debug.messageBox(n + " items were transferred");
        }
        /** React when the player presses the "Mark" hotkey. */
        var MarkItems = Hotkey.ListenTo(75);
        /** React when the player presses the "Transfer" hotkey. */
        var TransferItems = Hotkey.ListenTo(76);
        skyrimPlatform_3.printConsole("Easy Containers successfully initialized.");
        /** This code is executed every single frame.
         * It runs fast because most of the time it will only be asking if a key is pressed.
         * It's only when a key is pressed when all code above gets fired for just one frame.
         *
         * You can see how all of this is accomplished using `once()` if you check the code for
         * `Hotkey.ListenTo()`.
         */
        skyrimPlatform_3.on("update", function () {
            MarkItems(DoMarkItems);
            TransferItems(DoTransferItems);
        });
        // ===========================================================
        // Meh. Ignore all lines below.
        // I was testing things for other mod and I don't want to lose those tests.
        // I will eventually delete these lines.
        // ===========================================================
        // on("equip", (e) => {
        //   const b = e.actor.getBaseObject()
        //   // if (b) printConsole(`EQUIP. actor: ${b.getName()}. object: ${e.baseObj.getName()}`);
        // });
        // on("objectLoaded", (e) => {
        //   const a = Actor.from(e.object)
        //   const l = Actor.from(e.object)?.getLeveledActorBase()
        //   printConsole(`Leveled actor name ${l?.getName()} race: ${l?.getRace()?.getName()} class: ${l?.getClass()?.getName()}`)
        //   const base = Actor.from(e.object)?.getBaseObject()
        //   printConsole(`Base actor name ${base?.getName()}`)
        //   // printConsole(`UNLOADED raw name ${e.object?.getName()}`)
        //   const b = Actor.from(e.object)?.getLeveledActorBase()
        //   if (b) {
        //     const r = ActorBase.from(b)?.getRace()
        //     const c = ActorBase.from(b)?.getClass()
        //     // printConsole(`(UN)LOADED object: ${b.getName()}. loaded: ${e.isLoaded} class: ${c?.getName()} race: ${r?.getName()}`);
        //   }
        // });
        // on("unequip", (e) => {
        //   const b = e.actor.getBaseObject()
        //   // if (b) printConsole(`UNEQUIP. actor: ${b.getName()}. object: ${e.baseObj.getName()}`);
        // });
    }
    exports_7("main", main);
    return {
        setters: [
            function (skyrimPlatform_3_1) {
                skyrimPlatform_3 = skyrimPlatform_3_1;
            },
            function (Hotkey_1) {
                Hotkey = Hotkey_1;
            },
            function (D_1) {
                D = D_1;
            },
            function (Iteration_1_1) {
                Iteration_1 = Iteration_1_1;
            },
            function (JFormMap_1) {
                JFormMap = JFormMap_1;
            },
            function (JDB_1) {
                JDB = JDB_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("index", ["src/entry"], function (exports_8, context_8) {
    "use strict";
    var example;
    var __moduleName = context_8 && context_8.id;
    return {
        setters: [
            function (example_1) {
                example = example_1;
            }
        ],
        execute: function () {
            example.main();
        }
    };
});
