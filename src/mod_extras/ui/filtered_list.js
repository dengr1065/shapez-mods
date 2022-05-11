import { Signal } from "core/signal";
import { makeDivElement } from "core/utils";
import { MOD_ID } from "../constants";

const ROOT_CLS = (MOD_ID + ":filteredList").replaceAll(":", "_");

/** @template T */
export class FilteredList {
    /**
     * This component provides a ready-to-use list, as well as an
     * optional input which filters the provided items.
     * @param {T[]} list Initial list value
     * @param {boolean} filter Whether to allow filtering the list
     */
    constructor(list = [], filter = true) {
        this.list = list;
        this.renderedList = [];

        /** @type {{ item: T, element: HTMLElement }[]} */
        this.listEntries = [];

        this.container = makeDivElement(null, ["listContainer", ROOT_CLS]);
        this.filterInput = filter ? document.createElement("input") : null;
        /** @type {TypedSignal<[T]>} */
        this.itemSelected = new Signal();

        if (this.filterInput) {
            this.filterInput.classList.add("filter", ROOT_CLS);
            this.filterInput.addEventListener("input", () => this.refresh());
        }
    }

    /**
     * This function is responsible for returning the final list
     * to render, filtering it before returning.
     * @param {T[]} list
     * @param {string} string
     * @returns {T[]}
     */
    // eslint-disable-next-line no-unused-vars
    filter(list, string) {
        throw new Error("List filtering function is not defined!");
    }

    /**
     * This function is used to render a single item from the list.
     * It should return the rendered element.
     * @param {T} item
     * @returns {HTMLElement}
     * @abstract
     */
    // eslint-disable-next-line no-unused-vars
    render(item) {
        throw new Error("List renderer is not defined!");
    }

    /**
     * Generates elements for list elements, and removes elements
     * for items that were removed from the list.
     * @param {boolean} force Whether to cache everything again
     * @private
     */
    cacheElements(force = false) {
        if (force) {
            this.listEntries.splice(0);
        }

        // Delete elements for old list items
        const removedItems = this.listEntries.filter(
            ({ item: b }) => !this.list.some((a) => this.equals(a, b))
        );

        for (const item of removedItems) {
            this.listEntries.splice(this.listEntries.indexOf(item), 1);
        }

        // Generate new ones
        const newItems = this.list.filter(
            (a) => !this.listEntries.some(({ item: b }) => this.equals(a, b))
        );

        for (const item of newItems) {
            const element = this.render(item);
            element.addEventListener("click", () => {
                if (this.selectedItem == item) {
                    // Already selected
                    return;
                }

                this.deselect();
                element.classList.add("selected");
                this.itemSelected.dispatch(item);
            });

            this.listEntries.push({ item, element });
        }

        // Finally, sort the list just like the original one
        this.listEntries.sort(({ item: a }, { item: b }) => {
            return this.list.indexOf(a) - this.list.indexOf(b);
        });
    }

    /**
     * Call this method when the list items or filter string change.
     * Make sure to call this once the component is ready!
     * @param {boolean} force Whether to forecefully render again
     */
    refresh(force = false) {
        this.cacheElements(force);

        const filteredList = this.filter(this.list, this.filterInput.value);
        if (!force && this.itemsOrderEqual(this.renderedList, filteredList)) {
            // The list would be exactly the same, no need to render again
            return;
        }
        this.renderedList = filteredList;

        this.container.innerHTML = "";
        const fragment = document.createDocumentFragment();

        for (const item of filteredList) {
            const entry = this.listEntries.find((e) =>
                this.equals(e.item, item)
            );
            fragment.appendChild(entry.element);
        }

        this.container.appendChild(fragment);
    }

    /**
     * Checks whether lists of items are the same, including order.
     * @param {T[]} a
     * @param {T[]} b
     * @private
     */
    itemsOrderEqual(a, b) {
        if (!Array.isArray(a) || !Array.isArray(b)) {
            return false;
        }

        if (a.length !== b.length) {
            return false;
        }

        return a.every((v, i) => this.equals(v, b[i]));
    }

    /**
     * Comparator function to check whether items are equal.
     * Override to define custom behavior
     * @param {T} a
     * @param {T} b
     */
    equals(a, b) {
        // Basic equals implementation. Only works on strict primitive
        // types and immutable class instances or objects.
        return a == b;
    }

    get selectedItem() {
        return this.listEntries.find(({ element }) =>
            element.classList.contains("selected")
        )?.item;
    }

    /**
     * Deselect the currently selected item, or do nothing if
     * there is no selected item.
     */
    deselect() {
        for (const item of this.listEntries) {
            item.element.classList.remove("selected");
        }
    }

    /**
     * Select the specified item and dispatch itemSelected signal.
     * @param {T} newItem
     */
    select(newItem) {
        this.listEntries
            .find(({ item }) => {
                return item == newItem;
            })
            ?.element.click();
    }
}
