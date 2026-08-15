"use strict";

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
  normalized.crops = sortCrops(normalized.crops.map(normalizeCropData));
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
  if (previousVersion < 5) {
    DEFAULT_STATE.crops.forEach((crop) => {
      if (!normalized.crops.some((candidate) => candidate.id === crop.id || candidate.name === crop.name)) {
        normalized.crops.push(clone(crop));
      }
    });
  }
  if (previousVersion < 6) {
    normalized.enabledModifierIdsByCrop = {};
    if (Array.isArray(normalized.enabledModifierIds) && normalized.enabledModifierIds.length > 0) {
      normalized.enabledModifierIdsByCrop[normalized.selectedCropId] = normalized.enabledModifierIds;
    }
  }
  if (previousVersion < 10) {
    const agave = normalized.crops.find((crop) => crop.id === "crop-agave" || crop.name === "龙舌兰");
    if (agave) {
      agave.layoutWidth = 3;
      agave.layoutHeight = 2;
    }
  }
  if (previousVersion < 11) {
    normalized.crops.forEach((crop) => {
      const catalogCrop = DEFAULT_STATE.crops.find((candidate) => candidate.id === crop.id || candidate.name === crop.name);
      const layoutType = CROP_CONTAINER_CONFIG[catalogCrop?.layoutType] ? catalogCrop.layoutType : "generic";
      const container = CROP_CONTAINER_CONFIG[layoutType];
      crop.layoutType = layoutType;
      crop.layoutWidth = catalogCrop?.layoutWidth ?? container.width;
      crop.layoutHeight = catalogCrop?.layoutHeight ?? container.height;
    });
  }

  normalized.layout = normalizeLayoutState(normalized.layout, normalized.crops, normalized.modifiers);
  normalized.version = DEFAULT_STATE.version;
  normalized.selectedProcessingByCrop = normalizeProcessingSelections(
    normalized.crops,
    normalized.selectedProcessingByCrop
  );
  normalized.enabledModifierIdsByCrop = normalizeModifierSelections(
    normalized.crops,
    normalized.modifiers,
    normalized.enabledModifierIdsByCrop
  );
  delete normalized.enabledModifierIds;
  if (!normalized.crops.some((crop) => crop.id === normalized.selectedCropId)) normalized.selectedCropId = normalized.crops[0].id;
  return normalized;
}

function normalizeCropData(crop) {
  const catalogCrop = DEFAULT_STATE.crops.find((candidate) => candidate.id === crop.id || candidate.name === crop.name);
  const legacyYield = Number.isFinite(crop.yieldPerHarvest) ? crop.yieldPerHarvest : null;
  const minimumYield = crop.yieldPerHarvestMin ?? legacyYield ?? catalogCrop?.yieldPerHarvestMin ?? 0;
  const maximumYield = crop.yieldPerHarvestMax ?? legacyYield ?? catalogCrop?.yieldPerHarvestMax ?? minimumYield;
  return {
    ...catalogCrop,
    ...crop,
    yieldPerHarvestMin: minimumYield,
    yieldPerHarvestMax: Math.max(minimumYield, maximumYield),
    unitPrice: crop.unitPrice ?? catalogCrop?.unitPrice ?? 0,
    layoutType: CROP_CONTAINER_CONFIG[crop.layoutType]
      ? crop.layoutType
      : CROP_CONTAINER_CONFIG[catalogCrop?.layoutType] ? catalogCrop.layoutType : "generic",
    layoutWidth: Number.isInteger(crop.layoutWidth) && crop.layoutWidth > 0
      ? crop.layoutWidth
      : catalogCrop?.layoutWidth ?? 2,
    layoutHeight: Number.isInteger(crop.layoutHeight) && crop.layoutHeight > 0
      ? crop.layoutHeight
      : catalogCrop?.layoutHeight ?? 2,
    processingOptions: Array.isArray(crop.processingOptions)
      ? crop.processingOptions
      : clone(catalogCrop?.processingOptions ?? []),
  };
}

function normalizeLayoutState(layout, crops, modifiers) {
  const fallback = clone(DEFAULT_STATE.layout);
  if (!layout || typeof layout !== "object" || Array.isArray(layout)) return fallback;

  const buildingId = BUILDING_CONFIG[layout.buildingId] ? layout.buildingId : fallback.buildingId;
  const selectedCropId = crops.some((crop) => crop.id === layout.selectedCropId)
    ? layout.selectedCropId
    : crops[0].id;
  const selectedTool = LAYOUT_TOOL_CONFIG[layout.selectedTool] ? layout.selectedTool : fallback.selectedTool;
  const selectedFertilizerId = modifiers.some((modifier) => (
    modifier.id === layout.selectedFertilizerId && modifier.category === "fertilizer"
  )) ? layout.selectedFertilizerId : "";
  const objectsByBuilding = {};
  Object.entries(BUILDING_CONFIG).forEach(([id, building]) => {
    objectsByBuilding[id] = normalizeLayoutObjects(layout.objectsByBuilding?.[id], building, crops);
  });

  return {
    activeView: ["crop", "layout"].includes(layout.activeView) ? layout.activeView : fallback.activeView,
    buildingId,
    selectedCropId,
    selectedTool,
    selectedFertilizerId,
    objectsByBuilding,
  };
}

function normalizeLayoutObjects(objects, building, crops) {
  if (!Array.isArray(objects)) return [];
  const occupied = new Set();
  const validTypes = ["crop", "sprinkler", "grow-light"];
  return objects.flatMap((object) => {
    if (
      !object || !validTypes.includes(object.type) ||
      !Number.isInteger(object.x) || !Number.isInteger(object.y) ||
      object.x < 0 || object.y < 0 ||
      (object.type === "crop" && !crops.some((crop) => crop.id === object.cropId))
    ) return [];

    const normalized = {
      id: typeof object.id === "string" && object.id ? object.id : createId(`layout-${object.type}`),
      type: object.type,
      x: object.x,
      y: object.y,
      ...(object.type === "crop" ? { cropId: object.cropId } : {}),
    };
    const crop = normalized.type === "crop" ? crops.find((item) => item.id === normalized.cropId) : null;
    const dimensions = getLayoutToolDimensions(normalized.type, crop);
    if (
      normalized.x + dimensions.width > building.interiorWidth ||
      normalized.y + dimensions.height > building.interiorHeight
    ) return [];
    const footprintKeys = getLayoutFootprintCells(
      normalized.x,
      normalized.y,
      dimensions.width,
      dimensions.height
    ).map((cell) => getLayoutCellKey(cell.x, cell.y));
    if (footprintKeys.some((key) => occupied.has(key))) return [];
    footprintKeys.forEach((key) => occupied.add(key));
    return [normalized];
  });
}

function normalizeProcessingSelections(crops, selections) {
  if (!selections || typeof selections !== "object" || Array.isArray(selections)) return {};
  return Object.fromEntries(Object.entries(selections).filter(([cropId, optionId]) => {
    const crop = crops.find((candidate) => candidate.id === cropId);
    return crop?.processingOptions?.some((option) => option.id === optionId);
  }));
}

function normalizeModifierSelections(crops, modifiers, selections) {
  if (!selections || typeof selections !== "object" || Array.isArray(selections)) return {};
  return Object.fromEntries(Object.entries(selections).flatMap(([cropId, modifierIds]) => {
    if (!crops.some((crop) => crop.id === cropId) || !Array.isArray(modifierIds)) return [];
    const normalizedIds = normalizeEnabledModifierIds(modifiers, modifierIds);
    return normalizedIds.length > 0 ? [[cropId, normalizedIds]] : [];
  }));
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
  return (Array.isArray(enabledIds) ? enabledIds : []).filter((id, index, ids) => {
    if (ids.indexOf(id) !== index) return false;
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
    (Array.isArray(data.enabledModifierIds) || isValidModifierSelectionMap(data.enabledModifierIdsByCrop))
  );
}

function isValidModifierSelectionMap(selections) {
  return Boolean(
    selections &&
    typeof selections === "object" &&
    !Array.isArray(selections) &&
    Object.values(selections).every(Array.isArray)
  );
}

function isValidCrop(crop) {
  const yieldRange = crop ? getCropYieldRange(crop) : { min: NaN, max: NaN };
  return crop && typeof crop.id === "string" && typeof crop.name === "string" && crop.name.trim() &&
    isFiniteNonNegative(crop.matureMinutes) && crop.matureMinutes > 0 && isFiniteNonNegative(crop.regrowMinutes) &&
    isFiniteNonNegative(crop.harvests) && crop.harvests >= 1 && isFiniteNonNegative(yieldRange.min) &&
    isFiniteNonNegative(yieldRange.max) && yieldRange.max >= yieldRange.min &&
    (crop.unitPrice === undefined || isFiniteNonNegative(crop.unitPrice)) &&
    (crop.layoutType === undefined || Boolean(CROP_CONTAINER_CONFIG[crop.layoutType])) &&
    (crop.layoutWidth === undefined || (Number.isInteger(crop.layoutWidth) && crop.layoutWidth > 0)) &&
    (crop.layoutHeight === undefined || (Number.isInteger(crop.layoutHeight) && crop.layoutHeight > 0));
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
  if (!state.crops.some((crop) => crop.id === state.layout.selectedCropId)) state.layout.selectedCropId = state.crops[0].id;
}

function getSelectedCrop() {
  return state.crops.find((crop) => crop.id === state.selectedCropId) ?? state.crops[0];
}

function getSelectedProcessingOption(crop) {
  const selectedId = state.selectedProcessingByCrop?.[crop.id];
  return crop.processingOptions?.find((option) => option.id === selectedId) ?? null;
}

function setSelectedProcessingOption(crop, optionId) {
  const validOption = crop.processingOptions?.some((option) => option.id === optionId);
  if (validOption) state.selectedProcessingByCrop[crop.id] = optionId;
  else delete state.selectedProcessingByCrop[crop.id];
}

function getEnabledModifierIds(cropId) {
  const enabledIds = state.enabledModifierIdsByCrop?.[cropId];
  return Array.isArray(enabledIds) ? [...enabledIds] : [];
}

function setEnabledModifierIds(cropId, enabledIds) {
  const normalizedIds = normalizeEnabledModifierIds(state.modifiers, enabledIds);
  if (normalizedIds.length > 0) state.enabledModifierIdsByCrop[cropId] = normalizedIds;
  else delete state.enabledModifierIdsByCrop[cropId];
}

function getCropYieldRange(crop) {
  const legacyYield = Number.isFinite(crop?.yieldPerHarvest) ? crop.yieldPerHarvest : 0;
  const minimum = Number.isFinite(crop?.yieldPerHarvestMin) ? crop.yieldPerHarvestMin : legacyYield;
  const maximum = Number.isFinite(crop?.yieldPerHarvestMax) ? crop.yieldPerHarvestMax : minimum;
  return { min: minimum, max: Math.max(minimum, maximum) };
}

function getCropLayoutSize(crop) {
  const container = getCropContainer(crop);
  return {
    width: Number.isInteger(crop?.layoutWidth) && crop.layoutWidth > 0 ? crop.layoutWidth : container.width,
    height: Number.isInteger(crop?.layoutHeight) && crop.layoutHeight > 0 ? crop.layoutHeight : container.height,
  };
}

function getCropContainerType(crop) {
  return CROP_CONTAINER_CONFIG[crop?.layoutType] ? crop.layoutType : "generic";
}

function getCropContainer(crop) {
  return CROP_CONTAINER_CONFIG[getCropContainerType(crop)];
}

function findModifier(id) {
  return state.modifiers.find((modifier) => modifier.id === id);
}
