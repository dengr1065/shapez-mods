import { render } from "less";

const id = "__custom_css_style";

export function initialize(css) {
    const style = document.createElement("style");
    style.id = id;
    style.innerHTML = css;

    document.head.appendChild(style);
}

export function setCss(css) {
    document.getElementById(id).innerHTML = css;
}

export function compileLess(less) {
    return new Promise((resolve, reject) => {
        render(less, (err, out) => {
            if (err) reject(err);
            else resolve(out.css);
        });
    });
}
