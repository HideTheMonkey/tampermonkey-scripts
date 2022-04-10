// ==UserScript==
// @name         Jira Board Presentation View
// @namespace    HideTheMonkey
// @version      0.4.7
// @description  Adds a Presentation Mode checkbox to Jira board header with Ctrl-P (or Ctrl-Shift-P for fullscreen) hotkey.
// @author       Michael Hide
// @downloadURL  https://github.com/HideTheMonkey/tampermonkey-scripts/raw/master/tampermonkey_scripts/Jira%20Board%20Presentation%20View.user.js
// @updateURL    https://github.com/HideTheMonkey/tampermonkey-scripts/raw/master/tampermonkey_scripts/Jira%20Board%20Presentation%20View.user.js
// @match        *://*.atlassian.net/jira/software/c/projects/*
// @match        *://*.atlassian.net/secure/RapidBoard.jspa*
// @grant        GM_addStyle
// ==/UserScript==

GM_addStyle(
  '.tm-presentation {display: flex;flex-direction: row;-webkit-box-pack: center;justify-content: center;-webkit-box-align: center;align-items: center;height: 100%;position: relative;}'
);
GM_addStyle('.tm-presentation input {margin-right: 0.4em; margin-left: 1em}');

const get = (sel) => document.querySelector(sel);
const presentationCheckboxId = 'presentation-checkbox';
const dataFullscreenFlag = 'data-useFullscreen';

const openFullscreen = () => {
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen();
  }
};
const closeFullscreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen();
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
  if (options.kind) el.type = options.kind;
  if (options.onClick) el.onclick = options.onClick;
  return el;
};

const togglePresentationMode = (event) => {
  const isChecked = event.currentTarget && event.currentTarget.checked;
  const useFullscreen = !!event.currentTarget.attributes[dataFullscreenFlag];
  const header = get('#ghx-header');
  const operations = get('#ghx-operations');
  const work = get('#ghx-work');
  const plan = get('#ghx-plan');
  const contentDiv = get('#ghx-pool') || get('#ghx-backlog') || {};
  let currentHeight = get('#gh').clientHeight;
  if (isChecked) {
    if (useFullscreen) {
      openFullscreen();
    }
    header.style.display = 'none';
    operations.style.display = 'none';
    work.style.height = `${currentHeight}px`;
    work.style.marginTop = '1em';
    plan.style.height = `${currentHeight}px`;
    plan.style.marginTop = '1em';
    contentDiv.scrollTop = 0;
  } else {
    if (useFullscreen) {
      closeFullscreen();
    }
    event.currentTarget.removeAttribute(dataFullscreenFlag);
    currentHeight =
      currentHeight - header.clientHeight - operations.clientHeight;
    header.style.display = 'table';
    operations.style.display = 'block';
    work.style.height = `${currentHeight}px`;
    work.style.marginTop = null;
    plan.style.height = `${currentHeight}px`;
    plan.style.marginTop = null;
  }
  collapseHelpPanel(isChecked);
};

const collapseHelpPanel = (checked) => {
  const toggleButton = get('button[data-resize-button=true]');
  // Chrome vs. Firefox
  if (
    (toggleButton.ariaExpanded === 'true' ||
      toggleButton.attributes['aria-expanded'].value === 'true') &&
    checked
  ) {
    toggleButton.click();
  }
};

const addCheckbox = () => {
  const primaryNav = get('nav[aria-label="Primary Navigation"]')
    .lastElementChild;
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
  primaryNav.insertBefore(outerDiv, primaryNav.lastElementChild);
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
