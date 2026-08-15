"use strict";

function defineTemplateElement(tagName, markup) {
  if (customElements.get(tagName)) return;

  customElements.define(tagName, class extends HTMLElement {
    connectedCallback() {
      if (this.hasAttribute("data-rendered")) return;
      this.innerHTML = markup;
      this.setAttribute("data-rendered", "");
    }
  });
}
