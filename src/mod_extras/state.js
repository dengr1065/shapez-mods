import { TextualGameState } from "core/textual_game_state";
import { makeButton, makeDiv, makeDivElement } from "core/utils";
import { MODS } from "mods/modloader";
import { format, getMod, MOD_ID, T } from "./constants";
import {
    getAuthors,
    getAuthorString,
    getSortedMods,
    hasMissingDeps,
    isValidVersion,
    hasExtraMetadata,
    getDependencies,
    getScreenshots,
    dependencyLabel,
    getChangelog,
    isUpdateAvailable,
    getLatestVersion,
    getUpdateSummary
} from "./mod_helpers";
import { makeToggleButton } from "./ui/toggle_button";
import defaultIcon from "./assets/default_icon.webp";
import authorIcon from "./assets/author.webp";
import { nwLink } from "./website_fix";
import { Dialog } from "core/modal_dialog_elements";
import { showChangelogDialog } from "./ui/changelog";
import { FilteredList } from "./ui/filtered_list";

export const MOD_LIST_STATE = (MOD_ID + ":ModListState").replaceAll(":", "_");
const MOD_AUTHORS_ID = (MOD_ID + ":authors").replaceAll(":", "_");

/**
 * @param {import("platform/wrapper").PlatformWrapperInterface} wrapper
 */
function openAnchorLink(wrapper, event) {
    const url = this.href;
    if (!url.startsWith("#")) {
        event.preventDefault();
        wrapper.openExternalLink(url);
    }
}

export class ModListState extends TextualGameState {
    constructor() {
        super(MOD_LIST_STATE);

        this.mod = getMod();
        this.pluralRules = new Intl.PluralRules("en-US");
    }

    getStateHeaderTitle() {
        const count = MODS.mods.length;
        const plural = this.pluralRules.select(count);

        return format(T.activeMods[plural], { count });
    }

    /**
     * @param {import("mods/mod").Mod} mod
     */
    renderMod(mod) {
        const extra = mod.metadata.extra;

        const element = document.createElement("div");
        element.classList.add("mod");
        element.style.backgroundImage = `url('${extra?.icon ?? defaultIcon}')`;

        const hasUpdate = isUpdateAvailable(mod);
        element.classList.toggle("library", extra?.library ?? false);
        element.classList.toggle("invalid", !isValidVersion(mod));
        element.classList.toggle("missingDeps", hasMissingDeps(mod));
        element.classList.toggle("updateAvailable", hasUpdate);

        const basicInfo = makeDiv(element, undefined, ["basicInfo"]);
        makeDiv(basicInfo, undefined, ["name"]).innerText = mod.metadata.name;
        makeDiv(basicInfo, undefined, ["authors"]).innerText =
            getAuthorString(mod);

        makeDiv(element, undefined, ["description"]).innerText =
            mod.metadata.description;

        const versionText = hasUpdate ? T.modVersionUpdate : T.modVersion;
        makeDiv(element, undefined, ["version"]).innerText =
            versionText.replace("<x>", mod.metadata.version);

        return element;
    }

    /**
     * @param {import("mods/mod").Mod[]} mods
     * @param {string} filter
     */
    filterMods(mods, filter) {
        // toUpperCase is usually better for search, because it
        // allows to search for some letters without typing them
        filter = filter.toUpperCase();
        const words = filter.split(/\s+/);

        const showLibs = this.mod.settings.showLibraryMods;
        return mods.filter((mod) => {
            if (!showLibs && mod.metadata.extra?.library) {
                return false;
            }

            let name = mod.metadata.name.toUpperCase();
            if (mod.metadata.description) {
                // dirty, but it works for filtering
                name += mod.metadata.description.toUpperCase();
            }

            if (words.every((word) => name.includes(word))) {
                return true;
            }

            if (mod.metadata.id.toUpperCase().includes(filter)) {
                return true;
            }

            return false;
        });
    }

    showAuthors(mod) {
        const authors = getAuthors(mod);

        // Who thought using innerHTML is a good idea?
        const code = `<div id="${MOD_AUTHORS_ID}"></div>`;
        this.dialogs.internalShowDialog(
            new Dialog({
                app: this.app,
                title: T.authorsTitle,
                contentHTML: code,
                type: "info",
                buttons: [],
                closeButton: true
            })
        );

        const element = document.getElementById(MOD_AUTHORS_ID);
        for (const author of authors) {
            const authorDiv = makeDiv(element, undefined, ["author"]);
            const icon = makeDiv(authorDiv, undefined, ["icon"]);
            icon.style.backgroundImage = `url('${author.icon ?? authorIcon}')`;

            makeDiv(authorDiv, undefined, ["name"]).innerText = author.name;
            if (author.email) {
                makeDiv(authorDiv).innerText = author.email;
            }

            if (author.website && author.website.startsWith("https://")) {
                const website = makeDiv(authorDiv, undefined, ["website"]);
                website.innerText = T.viewWebsite;
                this.trackClicks(website, () =>
                    this.app.platformWrapper.openExternalLink(author.website)
                );
            }
        }
    }

    renderAdvancedInfo(element, mod) {
        const screenshots = getScreenshots(mod);
        const dependencies = getDependencies(mod);

        if (screenshots.length && dependencies.length) {
            element.classList.add("double");
        }

        if (screenshots.length) {
            makeDiv(element, undefined, ["title"]).innerText = T.screenshots;
            const div = makeDiv(element, undefined, ["screenshots"]);

            for (const screenshot of screenshots) {
                const img = document.createElement("img");
                img.addEventListener("load", () => {
                    img.classList.add("loaded");
                });
                img.src = screenshot.url;

                if (screenshot.description) {
                    img.alt = screenshot.description;
                }

                div.appendChild(img);
            }
        }

        if (dependencies.length) {
            const div = makeDiv(element, undefined, ["dependencies"]);
            const hint =
                T.dependencies.hint[dependencies.length > 1 ? "many" : "one"];

            makeDiv(div, undefined, ["title"]).innerText = T.dependencies.title;
            makeDiv(div, undefined, ["hint"]).innerText = hint;

            for (const dependency of dependencies) {
                const label = dependencyLabel(dependency);
                const depElement = makeDiv(div);

                const nameElement = document.createElement("span");
                nameElement.classList.add("name");
                nameElement.innerText = dependency.name;
                depElement.appendChild(nameElement);

                const versionElement = document.createElement("span");
                versionElement.classList.add("version");
                versionElement.innerText = dependency.version;
                depElement.appendChild(versionElement);

                if (label) {
                    const labelElement = document.createElement("span");
                    labelElement.classList.add("error");
                    labelElement.innerText = label;
                    depElement.appendChild(labelElement);
                }
            }
        }
    }

    renderNotice(element, title, summary) {
        const notice = makeDivElement(undefined, ["notice"]);
        makeDiv(notice, undefined, ["noticeTitle"]).innerText = title;
        makeDiv(notice, undefined, ["noticeSummary"]).innerText = summary;

        element.appendChild(notice);
    }

    renderInfoContainer() {
        const mod = this.modList.selectedItem;
        const element = makeDivElement(undefined, ["infoContainer"]);

        const meta = mod.metadata;
        const extra = meta.extra;

        const basicInfo = makeDiv(element, undefined, ["basicInfo"]);
        const textInfo = makeDiv(basicInfo);

        const name = makeDiv(textInfo, undefined, ["name"]);
        name.setAttribute("data-modid", meta.id);
        name.innerText = meta.name;

        const authors = makeDiv(textInfo, undefined, ["authors"]);
        authors.innerText = getAuthorString(mod);
        if (extra?.authors?.length) {
            authors.classList.add("link");
            this.trackClicks(authors, this.showAuthors.bind(this, mod));
        }

        const modActions = makeDiv(textInfo, undefined, ["actions"]);
        const addActionIf = (condition, label, handler) => {
            if (!condition) {
                return;
            }

            const button = makeButton(modActions, [], label);
            this.trackClicks(button, handler);
        };

        // Changelog (if valid version)
        addActionIf(
            isValidVersion(mod) && getChangelog(mod).length,
            T.changelog.view,
            () => showChangelogDialog(mod, false)
        );

        // View website
        addActionIf(
            meta.website && meta.website !== nwLink,
            T.viewWebsite,
            () => this.app.platformWrapper.openExternalLink(meta.website)
        );

        // After this check, extra is definitely an object, no check required
        if (!hasExtraMetadata(mod)) {
            makeDiv(element).innerText = T.noExtraInfo;
            return element;
        }

        // Settings state (if registered)
        addActionIf(
            extra.settingsState &&
                this.stateManager.stateClasses[extra.settingsState],
            T.openModSettings,
            () => this.moveToStateAddGoBack(extra.settingsState)
        );

        // Source code
        addActionIf(
            extra.source?.startsWith("https://"),
            T.viewSourceCode,
            () => this.app.platformWrapper.openExternalLink(extra.source)
        );

        if (!meta.doesNotAffectSavegame) {
            makeDiv(textInfo, undefined, ["affectsSavegame"]).innerText =
                T.affectsSavegame;
        }

        const icon = makeDiv(basicInfo, undefined, ["icon"]);
        icon.style.backgroundImage = `url('${extra.icon ?? defaultIcon}')`;

        if (getDependencies(mod).length || getScreenshots(mod).length) {
            const advInfo = makeDiv(element, undefined, ["advancedInfo"]);
            this.renderAdvancedInfo(advInfo, mod);
        }

        if (isUpdateAvailable(mod)) {
            const newVersion = getLatestVersion(mod);
            const updateSummary = getUpdateSummary(mod);

            this.renderNotice(
                element,
                T.update.title.replace("<x>", newVersion),
                updateSummary ?? T.update.noSummary
            );
        }

        if (extra.readme) {
            const readme = makeDiv(element, undefined, ["modReadme"]);
            readme.innerHTML = extra.readme;

            const readmeTitle = makeDivElement(undefined, ["title"]);
            readmeTitle.innerText = T.readme;
            readme.prepend(readmeTitle);

            // Handle links to open in browser
            const anchors = [...readme.getElementsByTagName("a")];
            const wrapper = this.app.platformWrapper;

            for (const anchor of anchors) {
                anchor.addEventListener("click", function (ev) {
                    openAnchorLink.call(this, wrapper, ev);
                });
            }
        }

        return element;
    }

    renderInfo() {
        this.modInfo.firstChild?.remove();
        const mod = this.modList.selectedItem;

        const noModSelected = mod == undefined;
        this.modInfo.classList.toggle("noModSelected", noModSelected);

        if (noModSelected) {
            // Mod Extras is excluded, because we're going to
            // explain what it does
            const hasMods = this.modList.list.length > 1;
            const text = hasMods
                ? T.chooseMod
                : T.noModsFound.replace("<mod>", this.mod.metadata.name);

            makeDiv(this.modInfo).innerHTML = text;

            const anchor = this.modInfo.querySelector("a");
            anchor?.addEventListener("click", (ev) => {
                ev.preventDefault();
                this.app.platformWrapper.openExternalLink(anchor.href);
            });
            return;
        }

        this.modInfo.appendChild(this.renderInfoContainer());
    }

    onEnter() {
        this.modList = new FilteredList(getSortedMods());
        this.modList.container.classList.add("modList");
        this.modList.filterInput.placeholder = T.filterModsHint;

        this.modList.filter = this.filterMods.bind(this);
        this.modList.render = this.renderMod.bind(this);
        this.modList.itemSelected.add(this.renderInfo, this);

        const headerBar = document.querySelector(".headerBar");
        const buttons = makeDiv(headerBar, undefined, ["buttons"]);

        // Header button to soft reload the game
        const reloadBtn = makeButton(buttons, ["reload"], T.reloadMods);
        this.trackClicks(reloadBtn, () =>
            this.app.platformWrapper.performRestart()
        );

        // Header button to open mods folder
        const openDirBtn = makeButton(buttons, ["openDir"], T.openModsFolder);
        this.trackClicks(openDirBtn, () => this.openModsFolder());

        // Layout base: split layout
        const content = document.querySelector(".mainContent");
        content.appendChild(this.modList.container);
        this.actions = makeDiv(content, undefined, ["actions"]);
        this.modInfo = makeDiv(content, undefined, ["modInfo"]);

        this.actions.appendChild(this.modList.filterInput);
        this.modList.filterInput.focus();

        const showLibraries = makeToggleButton(
            this.actions,
            T.showLibraryMods,
            this.mod.settings.showLibraryMods
        );

        this.trackClicks(showLibraries.element, () => {
            showLibraries.handler();
            this.mod.settings.showLibraryMods = showLibraries.value;
            this.modList.refresh();
        });

        // Do an initial check for mod updates
        this.mod.checkForModUpdates().then(() => {
            // Re-render the list, keep selected item
            const oldSelected = this.modList.selectedItem;
            this.modList.list = getSortedMods();
            this.modList.refresh(true);

            this.modList.select(oldSelected);
        });

        // Render when entering state
        this.modList.refresh();
        this.renderInfo();
    }

    openModsFolder() {
        // eslint-disable-next-line no-undef
        ipcRenderer.invoke("open-mods-folder");
    }

    onLeave() {
        this.mod.saveSettings();
    }
}
