import * as toggleButton from "./ui/toggle_button";
import * as helpers from "./mod_helpers";
import * as changelog from "./ui/changelog";
import * as filteredList from "./ui/filtered_list";
import * as utils from "./utils";

// This isn't really good, but allows quick access
window.ModExtras = utils.UTILS;

export default {
    ...toggleButton,
    ...helpers,
    ...changelog,
    ...filteredList,
    ...utils
};
