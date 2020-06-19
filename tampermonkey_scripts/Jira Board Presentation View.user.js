// ==UserScript==
// @name         Jira Board Presentation View
// @namespace    Winterlight
// @version      0.1
// @description  Add presentation checkbox to jira header
// @author       github@hidefamily.net
// @match        *://*.atlassian.net/secure/RapidBoard.jspa*
// @grant        GM_addStyle
// ==/UserScript==

// skip iframes
if (window.self != window.top) {
    return;
}

GM_addStyle('.tm-presentation {display: flex;flex-direction: row;-webkit-box-pack: center;justify-content: center;-webkit-box-align: center;align-items: center;height: 100%;position: relative;}');
GM_addStyle('.tm-presentation input {margin-right: 0.4em; margin-left: 1em}');

const get = sel => document.querySelector(sel);

const makeEl = (options) => {
    let el;
    if (options.text) {
        el = document.createTextNode(options.text);
    } else {
        el = document.createElement(options.tag);
    }
    if (options.className) el.className = options.className;
    if (options.tag === 'input') {
        if (options.kind) el.type = options.kind;
        if (options.onClick) {
            el.onclick = options.onClick;
        }
    }
    return el;
};

function toggleMode() {
    const header = get('#ghx-header');
    const operations = get('#ghx-operations');
    const work = get('#ghx-work');
    const gh = get('#gh');
    let currentHeight = gh.clientHeight;
    if (this.checked) {
        header.setAttribute("style", "display:none;");
        operations.setAttribute("style", "display:none;");
        work.setAttribute("style", `height:${currentHeight}px; margin-top: 1em`);
    } else {
        currentHeight = currentHeight - header.clientHeight - operations.clientHeight;
        header.setAttribute("style", "display:table;");
        operations.setAttribute("style", "display:block;");
        work.setAttribute("style", `height:${currentHeight}px; margin-top: unset;`);
    }
    toggleHelpPanel(this.checked);
};

const toggleHelpPanel = (checked) => {
    const toggleButton = get('#navigation-app button[class~=ak-navigation-resize-button]');
    if (toggleButton.ariaExpanded === 'true' && checked) {
        toggleButton.click();
    }
};

function addCheckbox() {
    const actionsDiv = get('header div[data-testid="atlassian-navigation--primary-actions"]');
    const outerDiv = makeEl({tag: 'div', className: 'tm-presentation'});
    const checkBox = makeEl({tag: 'input', kind: 'checkbox', onClick: toggleMode});
    const textNode = makeEl({text: 'Presentation Mode'});
    outerDiv.append(checkBox);
    outerDiv.append(textNode);
    actionsDiv.insertBefore(outerDiv, actionsDiv.lastElementChild);
}

window.addEventListener('load', (event) => {
    addCheckbox();
});
