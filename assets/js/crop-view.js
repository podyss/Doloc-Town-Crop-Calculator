"use strict";

function renderCropList() {
  const selectedCrop = getSelectedCrop();
  const selectedType = getCropContainerType(selectedCrop);
  const visibleCrops = state.crops.filter((crop) => getCropContainerType(crop) === selectedType);
  elements["crop-count"].textContent = `${CROP_CONTAINER_CONFIG[selectedType].name} · ${visibleCrops.length} 种`;
  elements["crop-category-tabs"].innerHTML = renderCropCategoryButtons(
    state.crops,
    selectedType,
    "data-crop-category"
  );
  elements["crop-category-tabs"].querySelectorAll("[data-crop-category]").forEach((button) => {
    button.addEventListener("click", () => selectCropCategory(button.dataset.cropCategory));
  });
  elements["crop-list"].innerHTML = visibleCrops
    .map((crop) => {
      const cropYield = getCropYieldRange(crop);
      return `
      <button class="crop-list-item ${crop.id === state.selectedCropId ? "active" : ""}" type="button" data-crop-id="${escapeHtml(crop.id)}">
        <span class="crop-dot" aria-hidden="true"></span>
        <span>
          <strong>${escapeHtml(crop.name)}</strong>
          <small>生长 ${formatDuration(crop.matureMinutes)} · ${formatRange(cropYield.min, cropYield.max)}个/次</small>
        </span>
      </button>
    `;
    })
    .join("");

  elements["crop-list"].querySelectorAll("[data-crop-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedCropId = button.dataset.cropId;
      persistState();
      render();
    });
    });
}

function selectCropCategory(type) {
  const firstCrop = state.crops.find((crop) => getCropContainerType(crop) === type);
  if (!firstCrop || getCropContainerType(getSelectedCrop()) === type) return;
  state.selectedCropId = firstCrop.id;
  persistState();
  render();
}

function renderModifierList() {
  if (state.modifiers.length === 0) {
    elements["modifier-list"].innerHTML = '<div class="empty-state">暂无加成选项</div>';
    return;
  }

  const crop = getSelectedCrop();
  const enabledModifierIds = getEnabledModifierIds(crop.id);
  elements["modifier-list"].innerHTML = Object.entries(CATEGORY_CONFIG)
    .map(([category, config]) => {
      const modifiers = state.modifiers.filter((modifier) => modifier.category === category);
      const selectedCount = modifiers.filter((modifier) => enabledModifierIds.includes(modifier.id)).length;
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
  const enabled = getEnabledModifierIds(crop.id).includes(modifier.id);
  const eligible = getCropYieldRange(crop).min >= modifier.minBaseYield;
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
  renderProcessingOptions(crop);
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

  elements["result-yield-detail"].textContent = calculation.hasSurvivalYield
    ? `基础 ${formatRange(calculation.yieldPerHarvestMin, calculation.yieldPerHarvestMax)} · 计时 +${formatNumber(calculation.survivalYieldBonus)}`
    : `每次 ${formatRange(calculation.yieldPerHarvestMin, calculation.yieldPerHarvestMax)} 个`;
  elements["result-total-yield"].textContent = formatRange(calculation.totalYieldMin, calculation.totalYieldMax);
  elements["result-daily-yield"].textContent = calculation.validSpeed
    ? formatRateRange(calculation.dailyYieldMin, calculation.dailyYieldMax)
    : "无法计算";
  elements["detail-harvests"].textContent = `${calculation.harvests} 次`;
  elements["detail-yield"].textContent = formatHarvestYieldSummary(calculation);
  elements["detail-total-yield"].textContent = `${formatRange(calculation.totalYieldMin, calculation.totalYieldMax)} 个`;
  elements["detail-daily-yield"].textContent = calculation.validSpeed
    ? `${formatRateRange(calculation.dailyYieldMin, calculation.dailyYieldMax)} 个/天`
    : "无法计算";
  renderValueCalculation(crop, calculation);
}

function buildYieldFormula(calculation) {
  const totalYield = formatRange(calculation.totalYieldMin, calculation.totalYieldMax);
  const dailyYield = formatRateRange(calculation.dailyYieldMin, calculation.dailyYieldMax);
  const dailyFormula = `${totalYield} ÷ (${formatNumber(calculation.totalMinutes)} ÷ 1,440) = ${dailyYield} 个/天`;
  if (!calculation.hasSurvivalYield) return `日产量：${dailyFormula}`;

  const bonuses = calculation.harvestDetails.map((harvest) => harvest.survivalYieldBonus);
  const bonusDetail = bonuses.length <= 8
    ? `（${bonuses.map(formatNumber).join(" + ")}）`
    : "";
  return `总产量：基础 ${formatRange(calculation.yieldPerHarvestMin, calculation.yieldPerHarvestMax)} × ${calculation.harvests} + 时间馈赠 ${formatNumber(calculation.survivalYieldBonus)}${bonusDetail} = ${totalYield}；日产量：${dailyFormula}`;
}

function formatHarvestYieldSummary(calculation) {
  if (!calculation.validSpeed || !calculation.hasSurvivalYield) {
    return `${formatRange(calculation.yieldPerHarvestMin, calculation.yieldPerHarvestMax)} 个`;
  }
  const minimum = Math.min(...calculation.harvestDetails.map((harvest) => harvest.yieldMin));
  const maximum = Math.max(...calculation.harvestDetails.map((harvest) => harvest.yieldMax));
  return `${formatRange(minimum, maximum)} 个`;
}

function renderProcessingOptions(crop) {
  const options = Array.isArray(crop.processingOptions) ? crop.processingOptions : [];
  const selected = getSelectedProcessingOption(crop);
  elements["processing-option"].innerHTML = [
    '<option value="">直接出售</option>',
    ...options.map((option) => `<option value="${escapeHtml(option.id)}">${escapeHtml(option.name)}</option>`),
  ].join("");
  elements["processing-option"].value = selected?.id ?? "";
  elements["processing-option"].disabled = options.length === 0;
  elements["processing-route"].textContent = selected
    ? selected.stages.map((stage) => stage.method).join(" → ")
    : options.length > 0 ? "不经过加工设备" : "当前作物没有加工路线";
}

function renderValueCalculation(crop, calculation) {
  const value = calculateValue(crop, calculation);
  elements["value-product"].textContent = value.productName;
  elements["value-unit-price"].textContent = formatNumber(value.unitPrice);
  elements["value-yield"].textContent = `${formatRange(value.finalYieldMin, value.finalYieldMax)} 个`;
  elements["value-total"].textContent = formatRange(value.finalValueMin, value.finalValueMax);
  elements["value-total-time"].textContent = value.validTime
    ? formatDurationRange(value.totalMinutesMin, value.totalMinutesMax)
    : "无法计算";
  elements["value-daily"].textContent = value.validTime
    ? `${formatRange(value.dailyValueMin, value.dailyValueMax)}/天`
    : "无法计算";
  elements["value-formula"].textContent = buildValueFormula(value);
}

function buildValueFormula(value) {
  const totalValue = formatRange(value.finalValueMin, value.finalValueMax);
  if (!value.validTime) return `产值：${totalValue}；日均产值无法计算`;

  const finalYield = formatRange(value.finalYieldMin, value.finalYieldMax);
  const totalTime = formatDurationRange(value.totalMinutesMin, value.totalMinutesMax);
  const dailyValue = formatRange(value.dailyValueMin, value.dailyValueMax);
  if (!value.processing) {
    return `直接出售：${finalYield} × ${formatNumber(value.unitPrice)} = ${totalValue}；${totalValue} ÷ ${totalTime} = ${dailyValue}/天`;
  }

  const processingTime = formatDurationRange(value.processingMinutesMin, value.processingMinutesMax);
  return `加工后：${finalYield} × ${formatNumber(value.unitPrice)} = ${totalValue}；加工 ${processingTime}，总耗时 ${totalTime}，日均 ${dailyValue}/天`;
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
  const cropId = getSelectedCrop().id;
  let enabledModifierIds = getEnabledModifierIds(cropId);

  if (enabled) {
    const config = CATEGORY_CONFIG[modifier.category];
    const selectedInCategory = enabledModifierIds.filter((modifierId) => findModifier(modifierId)?.category === modifier.category);
    if (config.maxSelected === 1) {
      enabledModifierIds = enabledModifierIds.filter((modifierId) => findModifier(modifierId)?.category !== modifier.category);
    } else if (selectedInCategory.length >= config.maxSelected) {
      showToast(`${config.label}最多选择 ${config.maxSelected} 个`);
      render();
      return;
    }
    if (!enabledModifierIds.includes(id)) enabledModifierIds.push(id);
  } else {
    enabledModifierIds = enabledModifierIds.filter((modifierId) => modifierId !== id);
  }
  setEnabledModifierIds(cropId, enabledModifierIds);
  persistState();
  render();
}

function selectProcessingOption() {
  const crop = getSelectedCrop();
  setSelectedProcessingOption(crop, elements["processing-option"].value);
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
  const cropYield = crop ? getCropYieldRange(crop) : { min: 1, max: 1 };
  elements["crop-yield-min"].value = cropYield.min;
  elements["crop-yield-max"].value = cropYield.max;
  elements["crop-price"].value = crop?.unitPrice ?? 0;
  elements["crop-layout-type"].value = getCropContainerType(crop);
  const cropLayoutSize = getCropLayoutSize(crop);
  elements["crop-layout-width"].value = cropLayoutSize.width;
  elements["crop-layout-height"].value = cropLayoutSize.height;
  elements["crop-dialog"].showModal();
  elements["crop-name"].focus();
}

function applyCropContainerPreset() {
  const container = CROP_CONTAINER_CONFIG[elements["crop-layout-type"].value] ?? CROP_CONTAINER_CONFIG.generic;
  elements["crop-layout-width"].value = container.width;
  elements["crop-layout-height"].value = container.height;
}

function saveCropFromForm(event) {
  event.preventDefault();
  const id = elements["crop-id"].value;
  const existingCrop = state.crops.find((item) => item.id === id);
  const yieldMin = Math.max(0, Number(elements["crop-yield-min"].value));
  const yieldMax = Math.max(yieldMin, Number(elements["crop-yield-max"].value));
  const crop = {
    ...existingCrop,
    id: id || createId("crop"),
    name: elements["crop-name"].value.trim(),
    matureMinutes: durationToMinutes(elements["crop-mature-value"].value, elements["crop-mature-unit"].value),
    regrowMinutes: durationToMinutes(elements["crop-regrow-value"].value, elements["crop-regrow-unit"].value),
    harvests: Math.max(1, Math.floor(Number(elements["crop-harvests"].value))),
    yieldPerHarvestMin: yieldMin,
    yieldPerHarvestMax: yieldMax,
    unitPrice: Math.max(0, Number(elements["crop-price"].value)),
    layoutType: elements["crop-layout-type"].value,
    layoutWidth: Math.max(1, Math.floor(Number(elements["crop-layout-width"].value))),
    layoutHeight: Math.max(1, Math.floor(Number(elements["crop-layout-height"].value))),
    processingOptions: existingCrop?.processingOptions ?? [],
  };

  if (
    !crop.name ||
    crop.matureMinutes <= 0 ||
    crop.regrowMinutes < 0 ||
    [crop.yieldPerHarvestMin, crop.yieldPerHarvestMax, crop.unitPrice, crop.layoutWidth, crop.layoutHeight]
      .some((value) => !Number.isFinite(value))
  ) return;
  const index = state.crops.findIndex((item) => item.id === id);
  if (index >= 0) state.crops[index] = crop;
  else state.crops.push(crop);
  let removedLayoutObjects = 0;
  Object.entries(BUILDING_CONFIG).forEach(([buildingId, building]) => {
    const objects = state.layout.objectsByBuilding[buildingId];
    const normalizedObjects = normalizeLayoutObjects(objects, building, state.crops);
    removedLayoutObjects += objects.length - normalizedObjects.length;
    state.layout.objectsByBuilding[buildingId] = normalizedObjects;
  });
  state.selectedCropId = crop.id;
  elements["crop-dialog"].close();
  persistState();
  render();
  const savedMessage = index >= 0 ? "作物已更新" : "作物已添加";
  showToast(removedLayoutObjects > 0 ? `${savedMessage}，已移除 ${removedLayoutObjects} 个冲突布局项` : savedMessage);
}

function requestCropDelete() {
  const crop = getSelectedCrop();
  if (state.crops.length === 1) {
    showToast("至少需要保留一种作物");
    return;
  }
  openConfirmation("删除作物", `确定删除“${crop.name}”吗？`, () => {
    state.crops = state.crops.filter((item) => item.id !== crop.id);
    delete state.selectedProcessingByCrop[crop.id];
    delete state.enabledModifierIdsByCrop[crop.id];
    state.selectedCropId = state.crops[0].id;
    if (state.layout.selectedCropId === crop.id) state.layout.selectedCropId = state.crops[0].id;
    Object.keys(state.layout.objectsByBuilding).forEach((buildingId) => {
      state.layout.objectsByBuilding[buildingId] = state.layout.objectsByBuilding[buildingId]
        .filter((object) => object.type !== "crop" || object.cropId !== crop.id);
    });
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
  state.enabledModifierIdsByCrop = normalizeModifierSelections(
    state.crops,
    state.modifiers,
    state.enabledModifierIdsByCrop
  );
  if (!state.modifiers.some((item) => item.id === state.layout.selectedFertilizerId && item.category === "fertilizer")) {
    state.layout.selectedFertilizerId = "";
  }
  elements["modifier-dialog"].close();
  persistState();
  render();
  showToast(index >= 0 ? "选项已更新" : "选项已添加");
}

function requestModifierDelete(id) {
  const modifier = findModifier(id);
  openConfirmation("删除选项", `确定删除“${modifier.name}”吗？`, () => {
    state.modifiers = state.modifiers.filter((item) => item.id !== id);
    if (state.layout.selectedFertilizerId === id) state.layout.selectedFertilizerId = "";
    Object.keys(state.enabledModifierIdsByCrop).forEach((cropId) => {
      setEnabledModifierIds(
        cropId,
        state.enabledModifierIdsByCrop[cropId].filter((modifierId) => modifierId !== id)
      );
    });
    persistState();
    render();
    showToast("选项已删除");
  });
}
