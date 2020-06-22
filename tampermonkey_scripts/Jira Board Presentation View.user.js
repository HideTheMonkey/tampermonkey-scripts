// ==UserScript==
// @name         Jira Board Presentation View
// @namespace    HideTheMonkey
// @version      0.2
// @description  Adds a Presentation Mode checkbox to Jira board header with Ctrl-P (or Ctrl-Shift-P for fullscreen) hotkey.
// @author       Michael Hide <github@hidefamily.net>
// @match        *://*.atlassian.net/secure/RapidBoard.jspa*
// @grant        GM_addStyle
// ==/UserScript==

GM_addStyle(
  '.tm-presentation {display: flex;flex-direction: row;-webkit-box-pack: center;justify-content: center;-webkit-box-align: center;align-items: center;height: 100%;position: relative;}'
);
GM_addStyle('.tm-presentation input {margin-right: 0.4em; margin-left: 1em}');

const get = (sel) => document.querySelector(sel);
const isNodeVisible = (el) => window.getComputedStyle(el).display !== 'none';
const presentationCheckboxId = 'presentation-checkbox';
const dataFullscreenFlag = 'data-useFullscreen';

const docEl = document.documentElement;
const openFullscreen = () => {
  if (docEl.requestFullscreen) {
    docEl.requestFullscreen();
  } else if (docEl.webkitRequestFullscreen) {
    docEl.webkitRequestFullscreen();
  }
};
const closeFullscreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  }
};

const makeEl = (options) => {
  let el;
  if (options.text) {
    el = document.createTextNode(options.text);
  } else {
    el = document.createElement(options.tag);
  }
  if (options.className) el.className = options.className;
  if (options.id) el.id = options.id;
  if (options.tag === 'input') {
    if (options.kind) el.type = options.kind;
    if (options.onClick) {
      el.onclick = options.onClick;
    }
  }
  return el;
};

const togglePresentationMode = (event) => {
  const isChecked = event.currentTarget && event.currentTarget.checked;
  const useFullscreen = !!event.currentTarget.attributes[dataFullscreenFlag];
  const header = get('#ghx-header');
  const operations = get('#ghx-operations');
  const work = get('#ghx-work');
  const plan = get('#ghx-plan');
  const isWorkVisible = isNodeVisible(work);
  const contentNode = isWorkVisible ? work : plan;
  const gh = get('#gh');
  let currentHeight = gh.clientHeight;
  if (isChecked) {
    if (useFullscreen) {
      openFullscreen();
    }
    header.style.display = 'none';
    operations.style.display = 'none';
    contentNode.style.height = `${currentHeight}px`;
    contentNode.style.marginTop = '1em';
  } else {
    if (useFullscreen) {
      closeFullscreen();
    }
    event.currentTarget.removeAttribute('data-useFullscreen');
    currentHeight =
      currentHeight - header.clientHeight - operations.clientHeight;
    header.style.display = 'table';
    operations.style.display = 'block';
    contentNode.style.height = `${currentHeight}px`;
    contentNode.style.marginTop = null;
  }
  toggleHelpPanel(isChecked);
};

const toggleHelpPanel = (checked) => {
  const toggleButton = get(
    '#navigation-app button[class~=ak-navigation-resize-button]'
  );
  if (toggleButton.ariaExpanded === 'true' && checked) {
    toggleButton.click();
  }
};

const addCheckbox = () => {
  const actionsDiv = get(
    'header div[data-testid="atlassian-navigation--primary-actions"]'
  );
  const outerDiv = makeEl({ tag: 'div', className: 'tm-presentation' });
  const checkBox = makeEl({
    tag: 'input',
    kind: 'checkbox',
    id: presentationCheckboxId,
    onClick: togglePresentationMode,
  });
  const textNode = makeEl({ text: 'Presentation Mode' });
  outerDiv.append(checkBox);
  outerDiv.append(textNode);
  actionsDiv.insertBefore(outerDiv, actionsDiv.lastElementChild);
};

window.addEventListener('load', (event) => {
  addCheckbox();
  // Add a key binding for Ctrl-P to toggle, and Ctrl-Shift-P to toggle fullscreen mode
  window.addEventListener('keydown', (e) => {
    if (e.keyCode == 80 && e.ctrlKey && !e.altKey && !e.metaKey) {
      const button = get(`#${presentationCheckboxId}`);
      if (e.shiftKey) {
        // Hackerman: pass a flag through button attributes
        button.setAttribute(dataFullscreenFlag, true);
      }
      button.click();
    }
  });
});
