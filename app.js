const STORAGE_KEY = "crop-calculator-data-v1";

const CATEGORY_CONFIG = {
  equipment: { label: "设备", description: "设备加成", maxSelected: Infinity },
  building: { label: "建筑", description: "最多选择 1 个", maxSelected: 1 },
  fertilizer: { label: "肥料", description: "最多选择 1 个", maxSelected: 1 },
  gene: { label: "基因", description: "最多选择 3 个", maxSelected: 3 },
};

const DEFAULT_STATE = {
  version: 4,
  crops: [
    {
      id: "crop-wheat",
      name: "小麦",
      matureMinutes: 4 * 24 * 60,
      regrowMinutes: 24 * 60,
      harvests: 1,
      yieldPerHarvest: 3,
    },
    {
      id: "crop-agave",
      name: "龙舌兰",
      matureMinutes: 20 * 24 * 60,
      regrowMinutes: 4 * 24 * 60,
      harvests: 1,
      yieldPerHarvest: 1,
    },
  ],
  modifiers: [
    {
      id: "modifier-grow-light",
      name: "农业补光灯",
      category: "equipment",
      speedPercent: 25,
      harvestBonus: 0,
      yieldFlat: 0,
      yieldPercent: 0,
      minBaseYield: 0,
    },
    {
      id: "modifier-organic-fertilizer",
      name: "有机肥",
      category: "fertilizer",
      speedPercent: 50,
      harvestBonus: 0,
      yieldFlat: 0,
      yieldPercent: 0,
      minBaseYield: 0,
    },
    {
      id: "modifier-fertilizer",
      name: "肥料",
      category: "fertilizer",
      speedPercent: 35,
      harvestBonus: 0,
      yieldFlat: 0,
      yieldPercent: 0,
      minBaseYield: 0,
    },
    {
      id: "modifier-long-flowering",
      name: "花期延长",
      category: "gene",
      speedPercent: -30,
      harvestBonus: 2,
      yieldFlat: 0,
      yieldPercent: 0,
      minBaseYield: 0,
    },
    {
      id: "modifier-wild-growth",
      name: "野蛮生长",
      category: "gene",
      speedPercent: 30,
      harvestBonus: 0,
      yieldFlat: 0,
      yieldPercent: 0,
      minBaseYield: 0,
    },
    {
      id: "modifier-plant-greenhouse",
      name: "植物大棚",
      category: "building",
      speedPercent: 20,
      harvestBonus: 0,
      yieldFlat: 0,
      yieldPercent: 0,
      minBaseYield: 0,
    },
    {
      id: "modifier-greenhouse",
      name: "温室",
      category: "building",
      speedPercent: 10,
      harvestBonus: 0,
      yieldFlat: 0,
      yieldPercent: 0,
      minBaseYield: 0,
    },
    {
      id: "modifier-multi-fruit",
      name: "分型作物",
      category: "gene",
      speedPercent: 0,
      harvestBonus: 0,
      yieldFlat: 1,
      yieldPercent: 0,
      minBaseYield: 3,
    },
    {
      id: "modifier-time-gift",
      name: "时间馈赠",
      category: "gene",
      speedPercent: 0,
      harvestBonus: 0,
      yieldFlat: 0,
      yieldPercent: 0,
      minBaseYield: 0,
      survivalYield: {
        intervalMinutes: 28 * 24 * 60,
        yieldPerInterval: 1,
      },
    },
  ],
  selectedCropId: "crop-wheat",
  enabledModifierIds: [],
};

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
    "crop-list",
    "selected-crop-name",
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
    "crop-yield",
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

  document.querySelectorAll(".close-dialog").forEach((button) => {
    button.addEventListener("click", () => button.closest("dialog").close());
  });

  document.querySelectorAll("dialog").forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  });
}

function render() {
  ensureValidSelection();
  renderCropList();
  renderModifierList();
  renderCalculation();
  refreshIcons();
}

function renderCropList() {
  elements["crop-count"].textContent = `${state.crops.length} 种`;
  elements["crop-list"].innerHTML = state.crops
    .map((crop) => `
      <button class="crop-list-item ${crop.id === state.selectedCropId ? "active" : ""}" type="button" data-crop-id="${escapeHtml(crop.id)}">
        <span class="crop-dot" aria-hidden="true"></span>
        <span>
          <strong>${escapeHtml(crop.name)}</strong>
          <small>生长 ${formatDuration(crop.matureMinutes)} · ${formatNumber(crop.yieldPerHarvest)}个/次</small>
        </span>
      </button>
    `)
    .join("");

  elements["crop-list"].querySelectorAll("[data-crop-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedCropId = button.dataset.cropId;
      persistState();
      render();
    });
  });
}

function renderModifierList() {
  if (state.modifiers.length === 0) {
    elements["modifier-list"].innerHTML = '<div class="empty-state">暂无加成选项</div>';
    return;
  }

  const crop = getSelectedCrop();
  elements["modifier-list"].innerHTML = Object.entries(CATEGORY_CONFIG)
    .map(([category, config]) => {
      const modifiers = state.modifiers.filter((modifier) => modifier.category === category);
      const selectedCount = modifiers.filter((modifier) => state.enabledModifierIds.includes(modifier.id)).length;
      const selectionLabel = Number.isFinite(config.maxSelected)
        ? `${selectedCount}/${config.maxSelected}`
        : `已选 ${selectedCount}`;
      const rows = modifiers.length > 0
        ? modifiers.map((modifier) => renderModifierRow(modifier, crop)).join("")
        : '<div class="empty-group">暂无选项</div>';

      return `
        <section class="modifier-group" aria-label="${escapeHtml(config.label)}">
          <div class="modifier-group-heading">
            <div>
              <h3>${escapeHtml(config.label)}</h3>
              <span>${escapeHtml(config.description)}</span>
            </div>
            <strong>${escapeHtml(selectionLabel)}</strong>
          </div>
          <div class="modifier-group-list">${rows}</div>
        </section>
      `;
    })
    .join("");

  elements["modifier-list"].querySelectorAll("[data-toggle-modifier]").forEach((input) => {
    input.addEventListener("change", () => toggleModifier(input.dataset.toggleModifier, input.checked));
  });
  elements["modifier-list"].querySelectorAll("[data-edit-modifier]").forEach((button) => {
    button.addEventListener("click", () => openModifierDialog(findModifier(button.dataset.editModifier)));
  });
  elements["modifier-list"].querySelectorAll("[data-delete-modifier]").forEach((button) => {
    button.addEventListener("click", () => requestModifierDelete(button.dataset.deleteModifier));
  });
}

function renderModifierRow(modifier, crop) {
  const enabled = state.enabledModifierIds.includes(modifier.id);
  const eligible = crop.yieldPerHarvest >= modifier.minBaseYield;
  const tags = buildEffectTags(modifier, eligible);
  const condition = modifier.minBaseYield > 0
    ? `基础产量 ≥ ${formatNumber(modifier.minBaseYield)} 时生效`
    : "适用于全部作物";

  return `
    <div class="modifier-row ${enabled ? "" : "disabled"}">
      <label class="check-control" title="${enabled ? "取消此选项" : "启用此选项"}">
        <input type="checkbox" data-toggle-modifier="${escapeHtml(modifier.id)}" ${enabled ? "checked" : ""}>
        <span class="check-mark"><i data-lucide="check"></i></span>
      </label>
      <div class="modifier-name">
        <strong>${escapeHtml(modifier.name)}</strong>
        <small>${escapeHtml(condition)}${enabled && !eligible ? " · 当前作物未达到门槛" : ""}</small>
      </div>
      <div class="modifier-row-actions">
        <button class="icon-button" type="button" data-edit-modifier="${escapeHtml(modifier.id)}" title="编辑选项" aria-label="编辑${escapeHtml(modifier.name)}">
          <i data-lucide="pencil"></i>
        </button>
        <button class="icon-button danger-icon" type="button" data-delete-modifier="${escapeHtml(modifier.id)}" title="删除选项" aria-label="删除${escapeHtml(modifier.name)}">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
      <div class="effect-tags">${tags}</div>
    </div>
  `;
}

function renderCalculation() {
  const crop = getSelectedCrop();
  const calculation = calculate(crop);
  elements["selected-crop-name"].textContent = crop.name;
  elements["modifier-total"].textContent = `总速度 ${formatSigned(calculation.speedPercent, "%")}`;

  if (!calculation.validSpeed) {
    elements["result-strip"].classList.add("error-strip");
    elements["result-first"].textContent = "无法计算";
    elements["result-first-minutes"].textContent = "总速度必须大于 0%";
    elements["result-total-time"].textContent = "无法计算";
    elements["result-harvest-count"].textContent = `共 ${calculation.harvests} 次`;
    elements["detail-speed"].textContent = `${calculation.speedFactor.toFixed(2)} 倍`;
    elements["detail-regrow"].textContent = "无法计算";
    elements["formula"].textContent = `${formatNumber(crop.matureMinutes)} ÷ (1 ${formatSigned(calculation.speedPercent, "%")})：总速度不能小于或等于 0`;
    elements["yield-formula"].textContent = "日产量：总速度无效，无法折算";
  } else {
    elements["result-strip"].classList.remove("error-strip");
    elements["result-first"].textContent = formatCompactDuration(calculation.firstMinutes);
    elements["result-first-minutes"].textContent = `${formatNumber(calculation.firstMinutes)} 分钟`;
    elements["result-total-time"].textContent = formatCompactDuration(calculation.totalMinutes);
    elements["result-harvest-count"].textContent = `共 ${calculation.harvests} 次`;
    elements["detail-speed"].textContent = `${calculation.speedFactor.toFixed(2)} 倍`;
    elements["detail-regrow"].textContent = formatDuration(calculation.regrowMinutes);
    elements["formula"].textContent = `时间：${formatNumber(crop.matureMinutes)} ÷ (1 ${formatSigned(calculation.speedPercent, "%")}) = ${formatNumber(calculation.firstMinutes)} 分钟（向上取整）`;
    elements["yield-formula"].textContent = buildYieldFormula(calculation);
  }

  elements["result-total-yield"].textContent = formatNumber(calculation.totalYield);
  elements["result-yield-detail"].textContent = calculation.hasSurvivalYield
    ? `基础 ${formatNumber(calculation.yieldPerHarvest)} · 计时 +${formatNumber(calculation.survivalYieldBonus)}`
    : `每次 ${formatNumber(calculation.yieldPerHarvest)} 个`;
  elements["result-daily-yield"].textContent = calculation.validSpeed ? formatNumber(calculation.dailyYield) : "无法计算";
  elements["detail-harvests"].textContent = `${calculation.harvests} 次`;
  elements["detail-yield"].textContent = formatHarvestYieldSummary(calculation);
  elements["detail-total-yield"].textContent = `${formatNumber(calculation.totalYield)} 个`;
  elements["detail-daily-yield"].textContent = calculation.validSpeed ? `${formatNumber(calculation.dailyYield)} 个/天` : "无法计算";
}

function calculate(crop) {
  const active = state.modifiers.filter((modifier) => state.enabledModifierIds.includes(modifier.id));
  const speedPercent = active.reduce((sum, modifier) => sum + modifier.speedPercent, 0);
  const speedFactor = 1 + speedPercent / 100;
  const harvestBonus = active.reduce((sum, modifier) => sum + modifier.harvestBonus, 0);
  const harvests = Math.max(1, Math.floor(crop.harvests + harvestBonus));
  const eligibleYieldModifiers = active.filter((modifier) => crop.yieldPerHarvest >= modifier.minBaseYield);
  const yieldPercent = eligibleYieldModifiers.reduce((sum, modifier) => sum + modifier.yieldPercent, 0);
  const yieldFlat = eligibleYieldModifiers.reduce((sum, modifier) => sum + modifier.yieldFlat, 0);
  const yieldPerHarvest = Math.max(0, crop.yieldPerHarvest * (1 + yieldPercent / 100) + yieldFlat);
  const survivalYieldModifiers = eligibleYieldModifiers.filter((modifier) => modifier.survivalYield);

  if (speedFactor <= 0) {
    return {
      validSpeed: false,
      speedPercent,
      speedFactor,
      harvests,
      yieldPerHarvest,
      totalYield: yieldPerHarvest * harvests,
      survivalYieldBonus: 0,
      hasSurvivalYield: survivalYieldModifiers.length > 0,
    };
  }

  const firstMinutes = Math.ceil(crop.matureMinutes / speedFactor);
  const regrowMinutes = Math.ceil(crop.regrowMinutes / speedFactor);
  const harvestDetails = Array.from({ length: harvests }, (_, index) => {
    const timeMinutes = firstMinutes + index * regrowMinutes;
    const survivalYieldBonus = survivalYieldModifiers.reduce((sum, modifier) => {
      const { intervalMinutes, yieldPerInterval } = modifier.survivalYield;
      return sum + Math.floor(timeMinutes / intervalMinutes) * yieldPerInterval;
    }, 0);
    return {
      timeMinutes,
      survivalYieldBonus,
      yield: yieldPerHarvest + survivalYieldBonus,
    };
  });
  const survivalYieldBonus = harvestDetails.reduce((sum, harvest) => sum + harvest.survivalYieldBonus, 0);
  const totalYield = harvestDetails.reduce((sum, harvest) => sum + harvest.yield, 0);
  return {
    validSpeed: true,
    speedPercent,
    speedFactor,
    harvests,
    yieldPerHarvest,
    totalYield,
    survivalYieldBonus,
    hasSurvivalYield: survivalYieldModifiers.length > 0,
    harvestDetails,
    firstMinutes,
    regrowMinutes,
    totalMinutes: firstMinutes + Math.max(0, harvests - 1) * regrowMinutes,
    get dailyYield() {
      return this.totalYield / (this.totalMinutes / 1440);
    },
  };
}

function buildYieldFormula(calculation) {
  const dailyFormula = `${formatNumber(calculation.totalYield)} ÷ (${formatNumber(calculation.totalMinutes)} ÷ 1,440) = ${formatNumber(calculation.dailyYield)} 个/天`;
  if (!calculation.hasSurvivalYield) return `日产量：${dailyFormula}`;

  const bonuses = calculation.harvestDetails.map((harvest) => harvest.survivalYieldBonus);
  const bonusDetail = bonuses.length <= 8
    ? `（${bonuses.map(formatNumber).join(" + ")}）`
    : "";
  return `总产量：基础 ${formatNumber(calculation.yieldPerHarvest)} × ${calculation.harvests} + 时间馈赠 ${formatNumber(calculation.survivalYieldBonus)}${bonusDetail} = ${formatNumber(calculation.totalYield)}；日产量：${dailyFormula}`;
}

function formatHarvestYieldSummary(calculation) {
  if (!calculation.validSpeed || !calculation.hasSurvivalYield) return `${formatNumber(calculation.yieldPerHarvest)} 个`;
  const yields = calculation.harvestDetails.map((harvest) => harvest.yield);
  const minimum = Math.min(...yields);
  const maximum = Math.max(...yields);
  return minimum === maximum
    ? `${formatNumber(minimum)} 个`
    : `${formatNumber(minimum)}–${formatNumber(maximum)} 个`;
}

function buildEffectTags(modifier, eligible) {
  const effects = [];
  if (modifier.speedPercent !== 0) effects.push([`速度 ${formatSigned(modifier.speedPercent, "%")}`, modifier.speedPercent > 0 ? "positive" : "negative"]);
  if (modifier.harvestBonus !== 0) effects.push([`收获 ${formatSigned(modifier.harvestBonus, "次")}`, modifier.harvestBonus > 0 ? "positive" : "negative"]);
  if (modifier.yieldFlat !== 0) effects.push([`单次产量 ${formatSigned(modifier.yieldFlat, "")}`, modifier.yieldFlat > 0 ? "positive" : "negative"]);
  if (modifier.yieldPercent !== 0) effects.push([`产量 ${formatSigned(modifier.yieldPercent, "%")}`, modifier.yieldPercent > 0 ? "positive" : "negative"]);
  if (modifier.survivalYield) {
    effects.push([`每存活 ${formatDuration(modifier.survivalYield.intervalMinutes)}，单次收获 +${formatNumber(modifier.survivalYield.yieldPerInterval)}`, "positive"]);
  }
  if (effects.length === 0) effects.push(["无数值变化", ""]);
  if (!eligible) effects.push(["未满足产量门槛", "negative"]);
  return effects.map(([label, className]) => `<span class="effect-tag ${className}">${escapeHtml(label)}</span>`).join("");
}

function toggleModifier(id, enabled) {
  const modifier = findModifier(id);
  if (!modifier) return;

  if (enabled) {
    const config = CATEGORY_CONFIG[modifier.category];
    const selectedInCategory = state.enabledModifierIds.filter((modifierId) => findModifier(modifierId)?.category === modifier.category);
    if (config.maxSelected === 1) {
      state.enabledModifierIds = state.enabledModifierIds.filter((modifierId) => findModifier(modifierId)?.category !== modifier.category);
    } else if (selectedInCategory.length >= config.maxSelected) {
      showToast(`${config.label}最多选择 ${config.maxSelected} 个`);
      render();
      return;
    }
    if (!state.enabledModifierIds.includes(id)) state.enabledModifierIds.push(id);
  } else {
    state.enabledModifierIds = state.enabledModifierIds.filter((modifierId) => modifierId !== id);
  }
  persistState();
  render();
}

function openCropDialog(crop = null) {
  elements["crop-form"].reset();
  elements["crop-dialog-title"].textContent = crop ? "编辑作物" : "添加作物";
  elements["crop-id"].value = crop?.id ?? "";
  elements["crop-name"].value = crop?.name ?? "";

  const mature = splitDuration(crop?.matureMinutes ?? 24 * 60);
  const regrow = splitDuration(crop?.regrowMinutes ?? 0);
  elements["crop-mature-value"].value = mature.value;
  elements["crop-mature-unit"].value = mature.unit;
  elements["crop-regrow-value"].value = regrow.value;
  elements["crop-regrow-unit"].value = regrow.unit;
  elements["crop-harvests"].value = crop?.harvests ?? 1;
  elements["crop-yield"].value = crop?.yieldPerHarvest ?? 1;
  elements["crop-dialog"].showModal();
  elements["crop-name"].focus();
}

function saveCropFromForm(event) {
  event.preventDefault();
  const id = elements["crop-id"].value;
  const crop = {
    id: id || createId("crop"),
    name: elements["crop-name"].value.trim(),
    matureMinutes: durationToMinutes(elements["crop-mature-value"].value, elements["crop-mature-unit"].value),
    regrowMinutes: durationToMinutes(elements["crop-regrow-value"].value, elements["crop-regrow-unit"].value),
    harvests: Math.max(1, Math.floor(Number(elements["crop-harvests"].value))),
    yieldPerHarvest: Math.max(0, Number(elements["crop-yield"].value)),
  };

  if (!crop.name || crop.matureMinutes <= 0 || crop.regrowMinutes < 0) return;
  const index = state.crops.findIndex((item) => item.id === id);
  if (index >= 0) state.crops[index] = crop;
  else state.crops.push(crop);
  state.selectedCropId = crop.id;
  elements["crop-dialog"].close();
  persistState();
  render();
  showToast(index >= 0 ? "作物已更新" : "作物已添加");
}

function requestCropDelete() {
  const crop = getSelectedCrop();
  if (state.crops.length === 1) {
    showToast("至少需要保留一种作物");
    return;
  }
  openConfirmation("删除作物", `确定删除“${crop.name}”吗？`, () => {
    state.crops = state.crops.filter((item) => item.id !== crop.id);
    state.selectedCropId = state.crops[0].id;
    persistState();
    render();
    showToast("作物已删除");
  });
}

function openModifierDialog(modifier = null) {
  elements["modifier-form"].reset();
  elements["modifier-dialog-title"].textContent = modifier ? "编辑选项" : "添加选项";
  elements["modifier-id"].value = modifier?.id ?? "";
  elements["modifier-name"].value = modifier?.name ?? "";
  elements["modifier-category"].value = modifier?.category ?? "equipment";
  elements["modifier-speed"].value = modifier?.speedPercent ?? 0;
  elements["modifier-harvests"].value = modifier?.harvestBonus ?? 0;
  elements["modifier-yield-flat"].value = modifier?.yieldFlat ?? 0;
  elements["modifier-yield-percent"].value = modifier?.yieldPercent ?? 0;
  elements["modifier-min-yield"].value = modifier?.minBaseYield ?? 0;
  elements["modifier-dialog"].showModal();
  elements["modifier-name"].focus();
}

function saveModifierFromForm(event) {
  event.preventDefault();
  const id = elements["modifier-id"].value;
  const existingModifier = state.modifiers.find((item) => item.id === id);
  const modifier = {
    id: id || createId("modifier"),
    name: elements["modifier-name"].value.trim(),
    category: elements["modifier-category"].value,
    speedPercent: Number(elements["modifier-speed"].value),
    harvestBonus: Math.floor(Number(elements["modifier-harvests"].value)),
    yieldFlat: Number(elements["modifier-yield-flat"].value),
    yieldPercent: Number(elements["modifier-yield-percent"].value),
    minBaseYield: Math.max(0, Number(elements["modifier-min-yield"].value)),
    survivalYield: existingModifier?.survivalYield ?? null,
  };
  if (!modifier.name || Object.values(modifier).some((value) => typeof value === "number" && !Number.isFinite(value))) return;

  const index = state.modifiers.findIndex((item) => item.id === id);
  if (index >= 0) state.modifiers[index] = modifier;
  else state.modifiers.push(modifier);
  state.enabledModifierIds = normalizeEnabledModifierIds(state.modifiers, state.enabledModifierIds);
  elements["modifier-dialog"].close();
  persistState();
  render();
  showToast(index >= 0 ? "选项已更新" : "选项已添加");
}

function requestModifierDelete(id) {
  const modifier = findModifier(id);
  openConfirmation("删除选项", `确定删除“${modifier.name}”吗？`, () => {
    state.modifiers = state.modifiers.filter((item) => item.id !== id);
    state.enabledModifierIds = state.enabledModifierIds.filter((modifierId) => modifierId !== id);
    persistState();
    render();
    showToast("选项已删除");
  });
}

function requestReset() {
  openConfirmation("恢复默认数据", "当前添加和修改的数据将被默认内容替换。", () => {
    state = clone(DEFAULT_STATE);
    persistState();
    elements["backup-dialog"].close();
    render();
    showToast("已恢复默认数据");
  });
}

function openConfirmation(title, message, action) {
  confirmAction = action;
  elements["confirm-title"].textContent = title;
  elements["confirm-message"].textContent = message;
  elements["confirm-dialog"].showModal();
}

function acceptConfirmation() {
  const action = confirmAction;
  closeConfirmation();
  if (action) action();
}

function closeConfirmation() {
  confirmAction = null;
  elements["confirm-dialog"].close();
}

function exportBackup() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `作物计算器备份-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
  showToast("备份已导出");
}

async function importBackup(event) {
  const [file] = event.target.files;
  event.target.value = "";
  if (!file) return;

  try {
    const imported = JSON.parse(await file.text());
    if (!isValidState(imported)) throw new Error("Invalid backup");
    state = normalizeState(imported);
    persistState();
    elements["backup-dialog"].close();
    render();
    showToast("备份已导入");
  } catch {
    showToast("无法导入：备份文件格式不正确");
  }
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return isValidState(saved) ? normalizeState(saved) : clone(DEFAULT_STATE);
  } catch {
    return clone(DEFAULT_STATE);
  }
}

function normalizeState(data) {
  const normalized = clone(data);
  const previousVersion = Number(normalized.version) || 1;
  normalized.modifiers = normalized.modifiers.map((modifier) => ({
    ...modifier,
    category: CATEGORY_CONFIG[modifier.category] ? modifier.category : inferModifierCategory(modifier),
    survivalYield: modifier.survivalYield ?? null,
  }));

  if (previousVersion < 2 && !normalized.modifiers.some((modifier) => modifier.id === "modifier-fertilizer" || modifier.name === "肥料")) {
    normalized.modifiers.push(clone(DEFAULT_STATE.modifiers.find((modifier) => modifier.id === "modifier-fertilizer")));
  }
  if (previousVersion < 3 && !normalized.crops.some((crop) => crop.id === "crop-agave" || crop.name === "龙舌兰")) {
    normalized.crops.push(clone(DEFAULT_STATE.crops.find((crop) => crop.id === "crop-agave")));
  }
  if (previousVersion < 4) {
    const defaultTimeGift = DEFAULT_STATE.modifiers.find((modifier) => modifier.id === "modifier-time-gift");
    const existingTimeGift = normalized.modifiers.find((modifier) => modifier.id === defaultTimeGift.id || modifier.name === defaultTimeGift.name);
    if (existingTimeGift) existingTimeGift.survivalYield = clone(defaultTimeGift.survivalYield);
    else normalized.modifiers.push(clone(defaultTimeGift));
  }

  normalized.version = DEFAULT_STATE.version;
  normalized.enabledModifierIds = normalizeEnabledModifierIds(normalized.modifiers, normalized.enabledModifierIds);
  if (!normalized.crops.some((crop) => crop.id === normalized.selectedCropId)) normalized.selectedCropId = normalized.crops[0].id;
  return normalized;
}

function inferModifierCategory(modifier) {
  if (modifier.id === "modifier-grow-light" || modifier.name === "农业补光灯") return "equipment";
  if (["modifier-plant-greenhouse", "modifier-greenhouse"].includes(modifier.id) || ["植物大棚", "温室"].includes(modifier.name)) return "building";
  if (["modifier-fertilizer", "modifier-organic-fertilizer"].includes(modifier.id) || ["肥料", "有机肥"].includes(modifier.name)) return "fertilizer";
  return "gene";
}

function normalizeEnabledModifierIds(modifiers, enabledIds) {
  const modifierById = new Map(modifiers.map((modifier) => [modifier.id, modifier]));
  const counts = {};
  return enabledIds.filter((id, index) => {
    if (enabledIds.indexOf(id) !== index) return false;
    const modifier = modifierById.get(id);
    if (!modifier || !CATEGORY_CONFIG[modifier.category]) return false;
    const config = CATEGORY_CONFIG[modifier.category];
    counts[modifier.category] = counts[modifier.category] ?? 0;
    if (counts[modifier.category] >= config.maxSelected) return false;
    counts[modifier.category] += 1;
    return true;
  });
}

function isValidState(data) {
  return Boolean(
    data &&
    Array.isArray(data.crops) &&
    data.crops.length > 0 &&
    data.crops.every(isValidCrop) &&
    Array.isArray(data.modifiers) &&
    data.modifiers.every(isValidModifier) &&
    Array.isArray(data.enabledModifierIds)
  );
}

function isValidCrop(crop) {
  return crop && typeof crop.id === "string" && typeof crop.name === "string" && crop.name.trim() &&
    isFiniteNonNegative(crop.matureMinutes) && crop.matureMinutes > 0 && isFiniteNonNegative(crop.regrowMinutes) &&
    isFiniteNonNegative(crop.harvests) && crop.harvests >= 1 && isFiniteNonNegative(crop.yieldPerHarvest);
}

function isValidModifier(modifier) {
  return modifier && typeof modifier.id === "string" && typeof modifier.name === "string" && modifier.name.trim() &&
    [modifier.speedPercent, modifier.harvestBonus, modifier.yieldFlat, modifier.yieldPercent, modifier.minBaseYield].every(Number.isFinite) &&
    modifier.minBaseYield >= 0 && (!modifier.category || typeof modifier.category === "string") &&
    isValidSurvivalYield(modifier.survivalYield);
}

function isValidSurvivalYield(survivalYield) {
  return survivalYield === undefined || survivalYield === null || Boolean(
    survivalYield &&
    Number.isFinite(survivalYield.intervalMinutes) && survivalYield.intervalMinutes > 0 &&
    Number.isFinite(survivalYield.yieldPerInterval) && survivalYield.yieldPerInterval >= 0
  );
}

function isFiniteNonNegative(value) {
  return Number.isFinite(value) && value >= 0;
}

function persistState() {
  elements["save-status"].textContent = "保存中";
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  requestAnimationFrame(() => {
    elements["save-status"].textContent = "已保存";
  });
}

function ensureValidSelection() {
  if (!state.crops.some((crop) => crop.id === state.selectedCropId)) state.selectedCropId = state.crops[0].id;
}

function getSelectedCrop() {
  return state.crops.find((crop) => crop.id === state.selectedCropId) ?? state.crops[0];
}

function findModifier(id) {
  return state.modifiers.find((modifier) => modifier.id === id);
}

function durationToMinutes(value, unit) {
  const multiplier = unit === "day" ? 1440 : unit === "hour" ? 60 : 1;
  return Number(value) * multiplier;
}

function splitDuration(minutes) {
  if (minutes > 0 && minutes % 1440 === 0) return { value: minutes / 1440, unit: "day" };
  if (minutes > 0 && minutes % 60 === 0) return { value: minutes / 60, unit: "hour" };
  return { value: minutes, unit: "minute" };
}

function formatDuration(minutes) {
  if (!Number.isFinite(minutes)) return "无法计算";
  if (minutes === 0) return "0分钟";
  const rounded = Math.ceil(minutes);
  const days = Math.floor(rounded / 1440);
  const hours = Math.floor((rounded % 1440) / 60);
  const remainingMinutes = rounded % 60;
  const parts = [];
  if (days) parts.push(`${days}天`);
  if (hours) parts.push(`${hours}小时`);
  if (remainingMinutes) parts.push(`${remainingMinutes}分钟`);
  return parts.join(" ");
}

function formatCompactDuration(minutes) {
  if (!Number.isFinite(minutes)) return "无法计算";
  if (minutes === 0) return "0分";
  const rounded = Math.ceil(minutes);
  const days = Math.floor(rounded / 1440);
  const hours = Math.floor((rounded % 1440) / 60);
  const remainingMinutes = rounded % 60;
  const parts = [];
  if (days) parts.push(`${days}天`);
  if (hours) parts.push(`${hours}时`);
  if (remainingMinutes) parts.push(`${remainingMinutes}分`);
  return parts.join("");
}

function formatSigned(value, suffix) {
  return `${value >= 0 ? "+" : ""}${formatNumber(value)}${suffix}`;
}

function formatNumber(value) {
  return new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 2 }).format(value);
}

function createId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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
