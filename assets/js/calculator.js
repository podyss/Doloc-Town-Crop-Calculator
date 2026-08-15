"use strict";

function calculate(crop, modifierOverride = null) {
  const enabledModifierIds = getEnabledModifierIds(crop.id);
  const active = Array.isArray(modifierOverride)
    ? modifierOverride
    : state.modifiers.filter((modifier) => enabledModifierIds.includes(modifier.id));
  const speedPercent = active.reduce((sum, modifier) => sum + modifier.speedPercent, 0);
  const speedFactor = 1 + speedPercent / 100;
  const harvestBonus = active.reduce((sum, modifier) => sum + modifier.harvestBonus, 0);
  const harvests = Math.max(1, Math.floor(crop.harvests + harvestBonus));
  const baseYield = getCropYieldRange(crop);
  const eligibleYieldModifiers = active.filter((modifier) => baseYield.min >= modifier.minBaseYield);
  const yieldPercent = eligibleYieldModifiers.reduce((sum, modifier) => sum + modifier.yieldPercent, 0);
  const yieldFlat = eligibleYieldModifiers.reduce((sum, modifier) => sum + modifier.yieldFlat, 0);
  const yieldPerHarvestMin = Math.max(0, baseYield.min * (1 + yieldPercent / 100) + yieldFlat);
  const yieldPerHarvestMax = Math.max(0, baseYield.max * (1 + yieldPercent / 100) + yieldFlat);
  const survivalYieldModifiers = eligibleYieldModifiers.filter((modifier) => modifier.survivalYield);

  if (speedFactor <= 0) {
    return {
      validSpeed: false,
      speedPercent,
      speedFactor,
      harvests,
      yieldPerHarvestMin,
      yieldPerHarvestMax,
      totalYieldMin: yieldPerHarvestMin * harvests,
      totalYieldMax: yieldPerHarvestMax * harvests,
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
      yieldMin: yieldPerHarvestMin + survivalYieldBonus,
      yieldMax: yieldPerHarvestMax + survivalYieldBonus,
    };
  });
  const survivalYieldBonus = harvestDetails.reduce((sum, harvest) => sum + harvest.survivalYieldBonus, 0);
  const totalYieldMin = harvestDetails.reduce((sum, harvest) => sum + harvest.yieldMin, 0);
  const totalYieldMax = harvestDetails.reduce((sum, harvest) => sum + harvest.yieldMax, 0);
  const totalMinutes = firstMinutes + Math.max(0, harvests - 1) * regrowMinutes;
  return {
    validSpeed: true,
    speedPercent,
    speedFactor,
    harvests,
    yieldPerHarvestMin,
    yieldPerHarvestMax,
    totalYieldMin,
    totalYieldMax,
    survivalYieldBonus,
    hasSurvivalYield: survivalYieldModifiers.length > 0,
    harvestDetails,
    firstMinutes,
    regrowMinutes,
    totalMinutes,
    dailyYieldMin: totalYieldMin / (totalMinutes / 1440),
    dailyYieldMax: totalYieldMax / (totalMinutes / 1440),
  };
}

function calculateValue(crop, calculation) {
  const processing = getSelectedProcessingOption(crop);
  const outputPerInputMin = processing?.outputPerInputMin ?? 1;
  const outputPerInputMax = processing?.outputPerInputMax ?? 1;
  const finalYieldMin = calculation.totalYieldMin * outputPerInputMin;
  const finalYieldMax = calculation.totalYieldMax * outputPerInputMax;
  const unitPrice = processing?.finalUnitPrice ?? crop.unitPrice ?? 0;
  const finalValueMin = finalYieldMin * unitPrice;
  const finalValueMax = finalYieldMax * unitPrice;
  const stages = Array.isArray(processing?.stages) ? processing.stages : [];
  const processingMinutes = processing
    ? stages.reduce((sum, stage) => sum + stage.durationMinutes, 0)
    : 0;
  const validTime = calculation.validSpeed;
  const firstProductMinutes = validTime ? calculation.firstMinutes + processingMinutes : null;
  const totalMinutesMin = firstProductMinutes;
  const totalMinutesMax = totalMinutesMin;
  const firstHarvest = validTime ? calculation.harvestDetails[0] : null;
  const startupFinalYieldMin = firstHarvest ? firstHarvest.yieldMin * outputPerInputMin : null;
  const startupFinalYieldMax = firstHarvest ? firstHarvest.yieldMax * outputPerInputMax : null;
  const startupDailyValueMin = validTime
    ? startupFinalYieldMin * unitPrice / (firstProductMinutes / 1440)
    : null;
  const startupDailyValueMax = validTime
    ? startupFinalYieldMax * unitPrice / (firstProductMinutes / 1440)
    : null;
  const dailyFinalYieldMin = validTime ? calculation.dailyYieldMin * outputPerInputMin : null;
  const dailyFinalYieldMax = validTime ? calculation.dailyYieldMax * outputPerInputMax : null;
  const dailyValues = validTime
    ? [
      dailyFinalYieldMin * unitPrice,
      dailyFinalYieldMax * unitPrice,
    ]
    : [];

  return {
    processing,
    productName: processing?.name ?? crop.name,
    unitPrice,
    outputPerInputMin,
    outputPerInputMax,
    finalYieldMin,
    finalYieldMax,
    finalValueMin,
    finalValueMax,
    processingMinutes,
    firstProductMinutes,
    totalMinutesMin,
    totalMinutesMax,
    startupFinalYieldMin,
    startupFinalYieldMax,
    startupDailyValueMin,
    startupDailyValueMax,
    dailyFinalYieldMin,
    dailyFinalYieldMax,
    dailyValueMin: dailyValues.length ? Math.min(...dailyValues) : null,
    dailyValueMax: dailyValues.length ? Math.max(...dailyValues) : null,
    validTime,
  };
}
