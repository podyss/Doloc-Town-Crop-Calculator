"use strict";

let layoutCropFilterType = "all";

function renderLayout() {
  const layout = state.layout;
  const building = BUILDING_CONFIG[layout.buildingId];
  const objects = getCurrentLayoutObjects();
  const maps = buildLayoutMaps(building, objects);
  const selectedLayoutCrop = state.crops.find((crop) => crop.id === layout.selectedCropId);
  const dimensions = getLayoutToolDimensions(layout.selectedTool, selectedLayoutCrop);

  renderLayoutCropPicker(selectedLayoutCrop);
  const processingOptions = Array.isArray(selectedLayoutCrop.processingOptions)
    ? selectedLayoutCrop.processingOptions
    : [];
  const selectedProcessing = getSelectedProcessingOption(selectedLayoutCrop);
  elements["layout-processing-select"].innerHTML = [
    '<option value="">直接出售</option>',
    ...processingOptions.map((option) => `<option value="${escapeHtml(option.id)}">${escapeHtml(option.name)}</option>`),
  ].join("");
  elements["layout-processing-select"].value = selectedProcessing?.id ?? "";
  elements["layout-processing-select"].disabled = processingOptions.length === 0;
  const fertilizerOptions = state.modifiers.filter((modifier) => modifier.category === "fertilizer");
  elements["layout-fertilizer-select"].innerHTML = [
    '<option value="">不使用</option>',
    ...fertilizerOptions.map((modifier) => `<option value="${escapeHtml(modifier.id)}">${escapeHtml(modifier.name)}</option>`),
  ].join("");
  elements["layout-fertilizer-select"].value = layout.selectedFertilizerId;

  document.querySelectorAll("[data-building-id]").forEach((button) => {
    button.classList.toggle("active", button.dataset.buildingId === layout.buildingId);
  });
  document.querySelectorAll("[data-layout-tool]").forEach((button) => {
    const active = button.dataset.layoutTool === layout.selectedTool;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  elements["layout-interior-size"].textContent = `${building.interiorWidth} × ${building.interiorHeight}`;
  elements["layout-main-size"].textContent = `${building.mainWidth} × ${building.mainHeight}`;
  elements["layout-building-speed"].textContent = `+${building.speedPercent}%`;
  elements["layout-crop-container"].textContent = getCropContainer(selectedLayoutCrop).name;
  elements["layout-tool-size"].textContent = `${dimensions.width} × ${dimensions.height}`;
  const coverageText = dimensions.coverageWidth
    ? `${dimensions.coverageWidth} × ${dimensions.coverageHeight}`
    : "无";
  elements["layout-tool-coverage"].innerHTML = `<strong>${coverageText}</strong> 覆盖`;
  elements["layout-building-name"].textContent = `${building.name} · ${building.interiorWidth} × ${building.interiorHeight}`;

  elements["layout-grid"].style.setProperty("--layout-columns", building.interiorWidth);
  elements["layout-grid"].style.setProperty("--layout-rows", building.interiorHeight);
  elements["layout-grid"].innerHTML = `${renderLayoutCells(building, maps)}${renderCoverageOutlines(building, objects)}`;

  const result = calculateLayout(building, objects, maps);
  const mainCells = building.mainWidth * building.mainHeight;
  const interiorCells = building.interiorWidth * building.interiorHeight;
  const equipmentCount = result.sprinklerCount + result.lightCount;
  elements["layout-daily-yield"].textContent = `${formatRateRange(result.dailyYieldMin, result.dailyYieldMax)} 个`;
  elements["layout-daily-value"].textContent = formatRange(result.dailyValueMin, result.dailyValueMax);
  elements["layout-daily-value-detail"].textContent = result.processedCropTypeCount > 0
    ? `含 ${result.processedCropTypeCount} 种加工产物及加工耗时`
    : "全部作物直接出售";
  elements["layout-main-cell-value"].textContent = formatRange(result.dailyValueMin / mainCells, result.dailyValueMax / mainCells);
  elements["layout-interior-cell-value"].textContent = formatRange(result.dailyValueMin / interiorCells, result.dailyValueMax / interiorCells);
  elements["layout-crop-status"].textContent = `有效 ${result.productiveCropCount} / 已种 ${result.cropCount} 个`;
  elements["layout-main-cell-detail"].textContent = `按 ${mainCells} 格建筑主体占地`;
  elements["layout-interior-cell-detail"].textContent = `按 ${interiorCells} 格室内面积`;
  elements["layout-equipment-count"].textContent = `${equipmentCount} 台`;
  elements["layout-coverage-status"].textContent = `浇灌 ${result.wateredCropCount} · 补光 ${result.litCropCount} 个`;
  renderLayoutBreakdown(result.breakdown);
}

function renderLayoutCells(building, maps) {
  const cells = [];
  for (let y = 0; y < building.interiorHeight; y += 1) {
    for (let x = 0; x < building.interiorWidth; x += 1) {
      const key = getLayoutCellKey(x, y);
      const object = maps.occupancy.get(key);
      let watered = maps.waterCoverage.has(key);
      let lit = maps.lightCoverage.has(key);
      if (object?.type === "crop") {
        const crop = state.crops.find((item) => item.id === object.cropId);
        const cropSize = getCropLayoutSize(crop);
        const footprint = getLayoutFootprintCells(object.x, object.y, cropSize.width, cropSize.height);
        watered = footprint.some((cell) => maps.waterCoverage.has(getLayoutCellKey(cell.x, cell.y)));
        lit = footprint.some((cell) => maps.lightCoverage.has(getLayoutCellKey(cell.x, cell.y)));
      }
      const classes = ["layout-cell"];
      if (watered) classes.push("water-covered");
      if (lit) classes.push("light-covered");

      let content = "";
      let description = `第 ${y + 1} 行，第 ${x + 1} 列，空格`;
      if (object?.type === "crop") {
        const crop = state.crops.find((item) => item.id === object.cropId);
        const isAnchor = object.x === x && object.y === y;
        classes.push("has-crop");
        if (isAnchor) classes.push("crop-anchor");
        if (!watered) classes.push("unwatered-crop");
        if (isAnchor) content = `<span class="layout-crop-mark">${escapeHtml((crop?.name ?? "?").slice(0, 1))}</span>`;
        description = `${crop?.name ?? "未知作物"}${watered ? "，已浇灌" : "，未浇灌"}${lit ? "，已补光" : ""}`;
      } else if (object) {
        const isAnchor = object.x === x && object.y === y;
        classes.push("has-equipment", `equipment-${object.type}`);
        if (isAnchor) classes.push("equipment-anchor");
        if (isAnchor) content = `<i data-lucide="${object.type === "sprinkler" ? "waves" : "sun"}"></i>`;
        description = LAYOUT_TOOL_CONFIG[object.type].name;
      }

      cells.push(`
        <button class="${classes.join(" ")}" type="button" role="gridcell" data-layout-cell data-x="${x}" data-y="${y}" title="${escapeHtml(description)}" aria-label="${escapeHtml(description)}">
          ${content}
        </button>
      `);
    }
  }
  return cells.join("");
}

function renderCoverageOutlines(building, objects) {
  return objects.filter((object) => ["sprinkler", "grow-light"].includes(object.type)).map((object) => {
    const dimensions = getLayoutToolDimensions(object.type);
    const startX = object.x + Math.floor((dimensions.width - dimensions.coverageWidth) / 2);
    const startY = object.y + Math.floor((dimensions.height - dimensions.coverageHeight) / 2);
    const x = Math.max(0, startX);
    const y = Math.max(0, startY);
    const endX = Math.min(building.interiorWidth, startX + dimensions.coverageWidth);
    const endY = Math.min(building.interiorHeight, startY + dimensions.coverageHeight);
    const width = Math.max(0, endX - x);
    const height = Math.max(0, endY - y);
    if (width === 0 || height === 0) return "";
    const coverageClass = object.type === "sprinkler" ? "water-coverage-outline" : "light-coverage-outline";
    return `<span class="coverage-outline ${coverageClass}" aria-hidden="true" style="left:${x * LAYOUT_CELL_SIZE}px;top:${y * LAYOUT_CELL_SIZE}px;width:${width * LAYOUT_CELL_SIZE}px;height:${height * LAYOUT_CELL_SIZE}px"></span>`;
  }).join("");
}

function renderLayoutBreakdown(breakdown) {
  if (breakdown.length === 0) {
    elements["layout-breakdown-table"].innerHTML = '<div class="layout-empty-state">暂无可计产作物</div>';
    return;
  }

  elements["layout-breakdown-table"].innerHTML = [
    '<div class="layout-breakdown-row layout-breakdown-header"><span>作物</span><span>种植</span><span>日产量</span><span>日产值</span></div>',
    ...breakdown.map((item) => `
      <div class="layout-breakdown-row">
        <div class="layout-breakdown-crop">
          <strong>${escapeHtml(item.crop.name)}</strong>
          <small>${escapeHtml(getCropContainer(item.crop).name)} · 有效 ${item.productiveCount}/${item.count} · 补光 ${item.litCount} · ${escapeHtml(item.productName)}</small>
        </div>
        <span>${item.count} 个</span>
        <strong>${formatRateRange(item.dailyYieldMin, item.dailyYieldMax)}</strong>
        <strong>${formatRange(item.dailyValueMin, item.dailyValueMax)}</strong>
      </div>
    `),
  ].join("");
}

function renderLayoutCropPicker(selectedCrop) {
  const container = getCropContainer(selectedCrop);
  const cropSize = getCropLayoutSize(selectedCrop);
  elements["layout-crop-selected-name"].textContent = selectedCrop.name;
  elements["layout-crop-selected-meta"].textContent = `${container.name} · ${cropSize.width} × ${cropSize.height}`;

  elements["layout-crop-filters"].innerHTML = [
    renderLayoutCropFilter("all", "全部", state.crops.length),
    ...Object.entries(CROP_CONTAINER_CONFIG).map(([type, config]) => {
      const count = state.crops.filter((crop) => getCropContainerType(crop) === type).length;
      return renderLayoutCropFilter(type, config.name, count);
    }),
  ].join("");
  renderLayoutCropPickerOptions();
}

function renderLayoutCropFilter(type, name, count) {
  const active = layoutCropFilterType === type;
  return `
    <button class="layout-crop-filter ${active ? "active" : ""}" type="button" data-layout-crop-filter="${escapeHtml(type)}" aria-pressed="${active}" ${count === 0 ? "disabled" : ""}>
      <span>${escapeHtml(name)}</span><small>${count}</small>
    </button>
  `;
}

function renderLayoutCropPickerOptions() {
  const query = elements["layout-crop-search"].value.trim().toLocaleLowerCase("zh-CN");
  const matches = state.crops.filter((crop) => {
    const matchesType = layoutCropFilterType === "all" || getCropContainerType(crop) === layoutCropFilterType;
    return matchesType && crop.name.toLocaleLowerCase("zh-CN").includes(query);
  });

  if (matches.length === 0) {
    elements["layout-crop-options"].innerHTML = `
      <div class="layout-crop-empty" role="status">
        <i data-lucide="search-x"></i>
        <span>没有匹配的作物</span>
      </div>
    `;
    refreshIcons();
    return;
  }

  elements["layout-crop-options"].innerHTML = Object.entries(CROP_CONTAINER_CONFIG).map(([type, config]) => {
    const crops = matches.filter((crop) => getCropContainerType(crop) === type);
    if (crops.length === 0) return "";
    const heading = layoutCropFilterType === "all"
      ? `<div class="layout-crop-group-heading"><span>${escapeHtml(config.name)}</span><small>${crops.length}</small></div>`
      : "";
    return `
      <div class="layout-crop-option-group" role="group" aria-label="${escapeHtml(config.name)}">
        ${heading}
        ${crops.map(renderLayoutCropOption).join("")}
      </div>
    `;
  }).join("");
  refreshIcons();
}

function renderLayoutCropOption(crop) {
  const selected = crop.id === state.layout.selectedCropId;
  const size = getCropLayoutSize(crop);
  return `
    <button class="layout-crop-option ${selected ? "selected" : ""}" type="button" role="option" aria-selected="${selected}" data-layout-crop-id="${escapeHtml(crop.id)}">
      <strong>${escapeHtml(crop.name)}</strong>
      <span>${size.width} × ${size.height}</span>
      <i data-lucide="check" aria-hidden="true"></i>
    </button>
  `;
}

function toggleLayoutCropPicker() {
  const panel = elements["layout-crop-picker-panel"];
  if (!panel.hidden) {
    closeLayoutCropPicker();
    return;
  }

  layoutCropFilterType = "all";
  elements["layout-crop-search"].value = "";
  panel.hidden = false;
  elements["layout-crop-trigger"].setAttribute("aria-expanded", "true");
  renderLayoutCropPicker(state.crops.find((crop) => crop.id === state.layout.selectedCropId));
  requestAnimationFrame(() => {
    const selectedOption = elements["layout-crop-options"].querySelector(".layout-crop-option.selected");
    if (selectedOption) {
      const optionRect = selectedOption.getBoundingClientRect();
      const listRect = elements["layout-crop-options"].getBoundingClientRect();
      elements["layout-crop-options"].scrollTop += optionRect.top - listRect.top - ((listRect.height - optionRect.height) / 2);
    }
    elements["layout-crop-search"].focus();
  });
}

function closeLayoutCropPicker({ restoreFocus = false } = {}) {
  if (!elements["layout-crop-picker-panel"] || elements["layout-crop-picker-panel"].hidden) return;
  elements["layout-crop-picker-panel"].hidden = true;
  elements["layout-crop-trigger"].setAttribute("aria-expanded", "false");
  if (restoreFocus) elements["layout-crop-trigger"].focus();
}

function handleLayoutCropFilterClick(event) {
  const button = event.target.closest("[data-layout-crop-filter]");
  if (!button || button.disabled) return;
  layoutCropFilterType = button.dataset.layoutCropFilter;
  const selectedCrop = state.crops.find((crop) => crop.id === state.layout.selectedCropId);
  renderLayoutCropPicker(selectedCrop);
  elements["layout-crop-search"].focus();
}

function handleLayoutCropOptionClick(event) {
  const button = event.target.closest("[data-layout-crop-id]");
  if (!button) return;
  selectLayoutCrop(button.dataset.layoutCropId);
}

function handleLayoutCropTriggerKeydown(event) {
  if (event.key !== "ArrowDown" || !elements["layout-crop-picker-panel"].hidden) return;
  event.preventDefault();
  toggleLayoutCropPicker();
}

function handleLayoutCropSearchKeydown(event) {
  if (event.key === "Escape") {
    event.preventDefault();
    closeLayoutCropPicker({ restoreFocus: true });
  }
  if (event.key === "ArrowDown") {
    const firstOption = elements["layout-crop-options"].querySelector(".layout-crop-option");
    if (firstOption) {
      event.preventDefault();
      firstOption.focus();
    }
  }
}

function handleLayoutCropOptionsKeydown(event) {
  if (event.key === "Escape") {
    event.preventDefault();
    closeLayoutCropPicker({ restoreFocus: true });
    return;
  }
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;

  const options = [...elements["layout-crop-options"].querySelectorAll(".layout-crop-option")];
  if (options.length === 0) return;
  event.preventDefault();
  const currentIndex = options.indexOf(document.activeElement);
  let nextIndex = currentIndex;
  if (event.key === "Home") nextIndex = 0;
  if (event.key === "End") nextIndex = options.length - 1;
  if (event.key === "ArrowDown") nextIndex = Math.min(currentIndex + 1, options.length - 1);
  if (event.key === "ArrowUp") nextIndex = currentIndex <= 0 ? 0 : currentIndex - 1;
  options[nextIndex].focus();
}

function selectLayoutCrop(cropId) {
  if (!state.crops.some((crop) => crop.id === cropId)) return;
  state.layout.selectedCropId = cropId;
  state.layout.selectedTool = "crop";
  closeLayoutCropPicker();
  persistState();
  render();
}

function selectLayoutProcessingOption() {
  const crop = state.crops.find((item) => item.id === state.layout.selectedCropId);
  if (!crop) return;
  setSelectedProcessingOption(crop, elements["layout-processing-select"].value);
  persistState();
  render();
}

function selectLayoutFertilizer() {
  state.layout.selectedFertilizerId = elements["layout-fertilizer-select"].value;
  persistState();
  render();
}

function selectLayoutBuilding(buildingId) {
  if (!BUILDING_CONFIG[buildingId] || state.layout.buildingId === buildingId) return;
  state.layout.buildingId = buildingId;
  persistState();
  render();
}

function selectLayoutTool(tool) {
  if (!LAYOUT_TOOL_CONFIG[tool]) return;
  state.layout.selectedTool = tool;
  persistState();
  render();
}

function handleLayoutGridClick(event) {
  const cell = event.target.closest("[data-layout-cell]");
  if (!cell) return;
  const x = Number(cell.dataset.x);
  const y = Number(cell.dataset.y);
  const building = BUILDING_CONFIG[state.layout.buildingId];
  const objects = getCurrentLayoutObjects();
  const maps = buildLayoutMaps(building, objects);
  const occupied = maps.occupancy.get(getLayoutCellKey(x, y));

  if (state.layout.selectedTool === "eraser") {
    if (!occupied) return;
    state.layout.objectsByBuilding[state.layout.buildingId] = objects.filter((object) => object.id !== occupied.id);
    persistState();
    render();
    return;
  }

  if (state.layout.selectedTool === "crop") {
    if (occupied?.type === "crop") {
      occupied.cropId = state.layout.selectedCropId;
    } else if (occupied) {
      showToast("该格已被设备占用");
      return;
    } else {
      const crop = state.crops.find((item) => item.id === state.layout.selectedCropId);
      const dimensions = getLayoutToolDimensions("crop", crop);
      if (x + dimensions.width > building.interiorWidth || y + dimensions.height > building.interiorHeight) {
        showToast("种植占地超出室内范围");
        return;
      }
      const footprint = getLayoutFootprintCells(x, y, dimensions.width, dimensions.height);
      if (footprint.some((position) => maps.occupancy.has(getLayoutCellKey(position.x, position.y)))) {
        showToast("种植占地与现有布局重叠");
        return;
      }
      objects.push({
        id: createId("layout-crop"),
        type: "crop",
        cropId: state.layout.selectedCropId,
        x,
        y,
      });
    }
    persistState();
    render();
    return;
  }

  const selectedCrop = state.crops.find((crop) => crop.id === state.layout.selectedCropId);
  const dimensions = getLayoutToolDimensions(state.layout.selectedTool, selectedCrop);
  if (x + dimensions.width > building.interiorWidth || y + dimensions.height > building.interiorHeight) {
    showToast("设备超出室内范围");
    return;
  }
  const footprint = getLayoutFootprintCells(x, y, dimensions.width, dimensions.height);
  if (footprint.some((position) => maps.occupancy.has(getLayoutCellKey(position.x, position.y)))) {
    showToast("设备占用范围与现有布局重叠");
    return;
  }
  objects.push({
    id: createId(`layout-${state.layout.selectedTool}`),
    type: state.layout.selectedTool,
    x,
    y,
  });
  persistState();
  render();
}

function requestLayoutClear() {
  if (getCurrentLayoutObjects().length === 0) {
    showToast("当前布局已经是空的");
    return;
  }
  const building = BUILDING_CONFIG[state.layout.buildingId];
  openConfirmation("清空布局", `确定清空“${building.name}”中的全部作物和设备吗？`, () => {
    state.layout.objectsByBuilding[state.layout.buildingId] = [];
    persistState();
    render();
    showToast("布局已清空");
  });
}

function getCurrentLayoutObjects() {
  return state.layout.objectsByBuilding[state.layout.buildingId];
}

function getLayoutToolDimensions(type, crop = null) {
  const tool = type === "crop"
    ? { ...LAYOUT_TOOL_CONFIG.crop, ...getCropLayoutSize(crop) }
    : LAYOUT_TOOL_CONFIG[type] ?? LAYOUT_TOOL_CONFIG.crop;
  return { ...tool };
}

function getLayoutFootprintCells(x, y, width, height) {
  const cells = [];
  for (let offsetY = 0; offsetY < height; offsetY += 1) {
    for (let offsetX = 0; offsetX < width; offsetX += 1) {
      cells.push({ x: x + offsetX, y: y + offsetY });
    }
  }
  return cells;
}

function buildLayoutMaps(building, objects) {
  const occupancy = new Map();
  const waterCoverage = new Set();
  const lightCoverage = new Set();

  objects.forEach((object) => {
    const crop = object.type === "crop" ? state.crops.find((item) => item.id === object.cropId) : null;
    const dimensions = getLayoutToolDimensions(object.type, crop);
    getLayoutFootprintCells(object.x, object.y, dimensions.width, dimensions.height).forEach((cell) => {
      occupancy.set(getLayoutCellKey(cell.x, cell.y), object);
    });

    if (!dimensions.coverageWidth) return;
    const coverage = object.type === "sprinkler" ? waterCoverage : lightCoverage;
    const startX = object.x + Math.floor((dimensions.width - dimensions.coverageWidth) / 2);
    const startY = object.y + Math.floor((dimensions.height - dimensions.coverageHeight) / 2);
    getLayoutFootprintCells(startX, startY, dimensions.coverageWidth, dimensions.coverageHeight).forEach((cell) => {
      if (
        cell.x >= 0 && cell.x < building.interiorWidth &&
        cell.y >= 0 && cell.y < building.interiorHeight
      ) coverage.add(getLayoutCellKey(cell.x, cell.y));
    });
  });

  return { occupancy, waterCoverage, lightCoverage };
}

function calculateLayout(building, objects, maps) {
  const breakdownByCrop = new Map();
  let cropCount = 0;
  let productiveCropCount = 0;
  let wateredCropCount = 0;
  let litCropCount = 0;
  let dailyYieldMin = 0;
  let dailyYieldMax = 0;
  let dailyValueMin = 0;
  let dailyValueMax = 0;

  objects.filter((object) => object.type === "crop").forEach((object) => {
    const crop = state.crops.find((item) => item.id === object.cropId);
    if (!crop) return;
    cropCount += 1;
    const cropSize = getCropLayoutSize(crop);
    const footprint = getLayoutFootprintCells(object.x, object.y, cropSize.width, cropSize.height);
    const watered = footprint.some((cell) => maps.waterCoverage.has(getLayoutCellKey(cell.x, cell.y)));
    const lit = footprint.some((cell) => maps.lightCoverage.has(getLayoutCellKey(cell.x, cell.y)));
    const item = breakdownByCrop.get(crop.id) ?? {
      crop,
      productName: getSelectedProcessingOption(crop)?.name ?? `${crop.name}（直接出售）`,
      processed: Boolean(getSelectedProcessingOption(crop)),
      count: 0,
      productiveCount: 0,
      litCount: 0,
      dailyYieldMin: 0,
      dailyYieldMax: 0,
      dailyValueMin: 0,
      dailyValueMax: 0,
    };
    item.count += 1;
    if (lit) {
      item.litCount += 1;
      litCropCount += 1;
    }

    if (watered) {
      wateredCropCount += 1;
      const calculation = calculate(crop, getLayoutModifiers(crop, building, lit));
      if (calculation.validSpeed) {
        const value = calculateValue(crop, calculation);
        const cropDailyValueMin = value.dailyValueMin;
        const cropDailyValueMax = value.dailyValueMax;
        dailyYieldMin += calculation.dailyYieldMin;
        dailyYieldMax += calculation.dailyYieldMax;
        dailyValueMin += cropDailyValueMin;
        dailyValueMax += cropDailyValueMax;
        productiveCropCount += 1;
        item.productiveCount += 1;
        item.dailyYieldMin += calculation.dailyYieldMin;
        item.dailyYieldMax += calculation.dailyYieldMax;
        item.dailyValueMin += cropDailyValueMin;
        item.dailyValueMax += cropDailyValueMax;
      }
    }
    breakdownByCrop.set(crop.id, item);
  });

  return {
    cropCount,
    productiveCropCount,
    wateredCropCount,
    litCropCount,
    sprinklerCount: objects.filter((object) => object.type === "sprinkler").length,
    lightCount: objects.filter((object) => object.type === "grow-light").length,
    dailyYieldMin,
    dailyYieldMax,
    dailyValueMin,
    dailyValueMax,
    processedCropTypeCount: [...breakdownByCrop.values()].filter((item) => (
      item.productiveCount > 0 && item.processed
    )).length,
    breakdown: [...breakdownByCrop.values()],
  };
}

function getLayoutModifiers(crop, building, lit) {
  const enabledIds = getEnabledModifierIds(crop.id);
  const savedModifiers = state.modifiers.filter((modifier) => enabledIds.includes(modifier.id) && modifier.category === "gene");
  const selectedFertilizer = state.modifiers.find((modifier) => (
    modifier.id === state.layout.selectedFertilizerId && modifier.category === "fertilizer"
  ));
  const layoutModifiers = [createSpeedModifier("layout-building", building.name, building.speedPercent)];
  if (selectedFertilizer) layoutModifiers.push(selectedFertilizer);
  if (lit) layoutModifiers.push(createSpeedModifier("layout-grow-light", "农业补光灯", LAYOUT_TOOL_CONFIG["grow-light"].speedPercent));
  return [...savedModifiers, ...layoutModifiers];
}

function createSpeedModifier(id, name, speedPercent) {
  return {
    id,
    name,
    category: "equipment",
    speedPercent,
    harvestBonus: 0,
    yieldFlat: 0,
    yieldPercent: 0,
    minBaseYield: 0,
    survivalYield: null,
  };
}

function getLayoutCellKey(x, y) {
  return `${x}:${y}`;
}
