"use strict";

let state = loadState();
let confirmAction = null;
let toastTimer = null;

const elements = {};

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  bindEvents();
  render();
  refreshIcons();
});

function cacheElements() {
  [
    "save-status",
    "crop-count",
    "crop-category-tabs",
    "crop-list",
    "selected-crop-name",
    "processing-option",
    "processing-route",
    "value-product",
    "value-unit-price",
    "value-yield",
    "value-total-time",
    "value-total",
    "value-daily",
    "value-formula",
    "result-strip",
    "result-first",
    "result-first-minutes",
    "result-total-time",
    "result-harvest-count",
    "result-total-yield",
    "result-yield-detail",
    "result-daily-yield",
    "modifier-total",
    "modifier-list",
    "detail-speed",
    "detail-regrow",
    "detail-harvests",
    "detail-yield",
    "detail-total-yield",
    "detail-daily-yield",
    "formula",
    "yield-formula",
    "crop-dialog",
    "crop-form",
    "crop-dialog-title",
    "crop-id",
    "crop-name",
    "crop-mature-value",
    "crop-mature-unit",
    "crop-regrow-value",
    "crop-regrow-unit",
    "crop-harvests",
    "crop-yield-min",
    "crop-yield-max",
    "crop-price",
    "crop-layout-type",
    "crop-layout-width",
    "crop-layout-height",
    "modifier-dialog",
    "modifier-form",
    "modifier-dialog-title",
    "modifier-id",
    "modifier-name",
    "modifier-category",
    "modifier-speed",
    "modifier-harvests",
    "modifier-yield-flat",
    "modifier-yield-percent",
    "modifier-min-yield",
    "backup-dialog",
    "confirm-dialog",
    "confirm-title",
    "confirm-message",
    "confirm-accept",
    "confirm-cancel",
    "import-file",
    "toast",
    "crop-result-view",
    "crop-view",
    "layout-view",
    "layout-crop-picker",
    "layout-crop-trigger",
    "layout-crop-selected-name",
    "layout-crop-selected-meta",
    "layout-crop-picker-panel",
    "layout-crop-search",
    "layout-crop-filters",
    "layout-crop-options",
    "layout-processing-select",
    "layout-fertilizer-select",
    "layout-interior-size",
    "layout-main-size",
    "layout-building-speed",
    "layout-crop-container",
    "layout-tool-size",
    "layout-tool-coverage",
    "layout-daily-yield",
    "layout-daily-value",
    "layout-daily-value-detail",
    "layout-main-cell-value",
    "layout-interior-cell-value",
    "layout-crop-status",
    "layout-main-cell-detail",
    "layout-interior-cell-detail",
    "layout-equipment-count",
    "layout-coverage-status",
    "layout-building-name",
    "layout-grid",
    "layout-breakdown-table",
    "clear-layout",
  ].forEach((id) => {
    elements[id] = document.getElementById(id);
  });
}

function bindEvents() {
  document.getElementById("add-crop-button").addEventListener("click", () => openCropDialog());
  document.getElementById("edit-crop-button").addEventListener("click", () => openCropDialog(getSelectedCrop()));
  document.getElementById("delete-crop-button").addEventListener("click", requestCropDelete);
  document.getElementById("add-modifier-button").addEventListener("click", () => openModifierDialog());
  document.getElementById("backup-button").addEventListener("click", () => elements["backup-dialog"].showModal());
  document.getElementById("export-button").addEventListener("click", exportBackup);
  document.getElementById("import-button").addEventListener("click", () => elements["import-file"].click());
  document.getElementById("reset-button").addEventListener("click", requestReset);

  elements["crop-form"].addEventListener("submit", saveCropFromForm);
  elements["modifier-form"].addEventListener("submit", saveModifierFromForm);
  elements["import-file"].addEventListener("change", importBackup);
  elements["confirm-accept"].addEventListener("click", acceptConfirmation);
  elements["confirm-cancel"].addEventListener("click", closeConfirmation);
  elements["processing-option"].addEventListener("change", selectProcessingOption);
  elements["layout-crop-trigger"].addEventListener("click", toggleLayoutCropPicker);
  elements["layout-crop-trigger"].addEventListener("keydown", handleLayoutCropTriggerKeydown);
  elements["layout-crop-search"].addEventListener("input", renderLayoutCropPickerOptions);
  elements["layout-crop-search"].addEventListener("keydown", handleLayoutCropSearchKeydown);
  elements["layout-crop-filters"].addEventListener("click", handleLayoutCropFilterClick);
  elements["layout-crop-options"].addEventListener("click", handleLayoutCropOptionClick);
  elements["layout-crop-options"].addEventListener("keydown", handleLayoutCropOptionsKeydown);
  elements["layout-processing-select"].addEventListener("change", selectLayoutProcessingOption);
  elements["layout-fertilizer-select"].addEventListener("change", selectLayoutFertilizer);
  elements["crop-layout-type"].addEventListener("change", applyCropContainerPreset);
  elements["layout-grid"].addEventListener("click", handleLayoutGridClick);
  elements["clear-layout"].addEventListener("click", requestLayoutClear);

  document.addEventListener("pointerdown", (event) => {
    if (!elements["layout-crop-picker"].contains(event.target)) closeLayoutCropPicker();
  });

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => selectView(button.dataset.view));
  });
  document.querySelectorAll("[data-building-id]").forEach((button) => {
    button.addEventListener("click", () => selectLayoutBuilding(button.dataset.buildingId));
  });
  document.querySelectorAll("[data-layout-tool]").forEach((button) => {
    button.addEventListener("click", () => selectLayoutTool(button.dataset.layoutTool));
  });

  document.querySelectorAll(".close-dialog").forEach((button) => {
    button.addEventListener("click", () => button.closest("dialog").close());
  });

  document.querySelectorAll("dialog").forEach((dialog) => {
    let pointerDownOnBackdrop = false;

    dialog.addEventListener("pointerdown", (event) => {
      pointerDownOnBackdrop = event.target === dialog;
    });

    dialog.addEventListener("pointercancel", () => {
      pointerDownOnBackdrop = false;
    });

    dialog.addEventListener("click", (event) => {
      if (event.target === dialog && pointerDownOnBackdrop) dialog.close();
      pointerDownOnBackdrop = false;
    });
  });
}

function render() {
  ensureValidSelection();
  renderView();
  renderCropList();
  renderModifierList();
  renderCalculation();
  renderLayout();
  refreshIcons();
}

function renderView() {
  const activeView = state.layout.activeView;
  const cropActive = activeView === "crop";
  elements["crop-result-view"].hidden = !cropActive;
  elements["crop-view"].hidden = !cropActive;
  elements["layout-view"].hidden = cropActive;
  document.querySelectorAll("[data-view]").forEach((button) => {
    const active = button.dataset.view === activeView;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
}

function selectView(view) {
  if (!['crop', 'layout'].includes(view) || state.layout.activeView === view) return;
  closeLayoutCropPicker();
  state.layout.activeView = view;
  persistState();
  render();
}

function showToast(message) {
  clearTimeout(toastTimer);
  elements["toast"].textContent = message;
  elements["toast"].classList.add("show");
  toastTimer = setTimeout(() => elements["toast"].classList.remove("show"), 2200);
}

function refreshIcons() {
  if (window.lucide) window.lucide.createIcons();
}
