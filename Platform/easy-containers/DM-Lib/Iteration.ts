import { Form, ObjectReference } from "../skyrimPlatform"

/**
 * Iterates over all items belonging to some `ObjectReference`, from last to first.
 * @param o - The object reference to iterate over.
 * @param f - Function applied over each item.
 */
export function ForEachItemR(
  o: ObjectReference,
  f: (item: Form | null) => void
) {
  let i = o.getNumItems()
  while (i > 0) {
    i--
    f(o.getNthForm(i))
  }
}
