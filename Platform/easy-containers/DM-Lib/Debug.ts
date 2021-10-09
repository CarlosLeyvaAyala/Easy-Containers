/**
 * Module for debugging-related functions.
 */
import { printConsole, Utility } from "../skyrimPlatform"

/** How much will the console be spammed.
 * - Optimization - Meant to only output the times functions take to execute. Used for bottleneck solving.
 * - None
 * - Error - Just errors
 * - Info - Detailed info so the players can know if things are going as expected, but not enough for actual debugging.
 * - Verbose - Info meant for developers.
 */
export enum LoggingLevel {
  Optimization = -1,
  None,
  Error,
  Info,
  Verbose,
}

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
export function CreateLoggingFunction(
  modName: string,
  currLogLvl: LoggingLevel,
  logAt: LoggingLevel
) {
  return function (msg: string) {
    const m = `[${modName}] ${msg}`

    if (currLogLvl >= logAt || (currLogLvl < 0 && currLogLvl === logAt))
      printConsole(m)
  }
}

/**
 * Makes a logging function to log a value, then returns that value.
 * @param f - The logging function.
 * @returns `function <T>(msg: string, x: T): T`
 *
 * @remarks
 * This function is intended to be used to initialize variables while logging them at the same time.
 */
export function TapLog(f: (s: string) => void) {
  return function <T>(msg: string, x: T): T {
    f(`${msg}: ${x}`)
    return x
  }
}

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
export function Log<T>(msg: string, x: T): T {
  if (x) printConsole(`${msg} ${x}`)
  else printConsole(msg)
  return x
}

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
export function Benchmark(f: () => void): () => void {
  return () => {
    const t1 = Log(`${f.name} start time`, Utility.getCurrentRealTime())
    f()
    const t2 = Log(`${f.name} end time`, Utility.getCurrentRealTime())
    Log(`Execution time for ${f.name}: `, t2 - t1)
  }
}
