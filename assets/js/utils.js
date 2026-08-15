"use strict";

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

function formatDurationRange(minimum, maximum) {
  const minText = formatDuration(minimum);
  const maxText = formatDuration(maximum);
  return minText === maxText ? minText : `${minText}–${maxText}`;
}

function formatSigned(value, suffix) {
  return `${value >= 0 ? "+" : ""}${formatNumber(value)}${suffix}`;
}

function formatNumber(value) {
  return new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 2 }).format(value);
}

function formatRange(minimum, maximum) {
  const minText = formatNumber(minimum);
  const maxText = formatNumber(maximum);
  if (minText === maxText) return minText;
  return formatNumber((minimum + maximum) / 2);
}

function formatRateRange(minimum, maximum) {
  const formatter = new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 4 });
  const minText = formatter.format(minimum);
  const maxText = formatter.format(maximum);
  if (minText === maxText) return minText;
  return formatter.format((minimum + maximum) / 2);
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

function sortCrops(crops) {
  return [...crops].sort((first, second) => {
    const firstIndex = CROP_ORDER_INDEX.get(first.id) ?? CROP_ORDER.length;
    const secondIndex = CROP_ORDER_INDEX.get(second.id) ?? CROP_ORDER.length;
    return firstIndex - secondIndex;
  });
}

function renderCropCategoryButtons(crops, selectedType, dataAttribute) {
  return Object.entries(CROP_CONTAINER_CONFIG).map(([type, config]) => {
    const count = crops.filter((crop) => getCropContainerType(crop) === type).length;
    const active = type === selectedType;
    return `
      <button class="crop-category-option ${active ? "active" : ""}" type="button" ${dataAttribute}="${escapeHtml(type)}" aria-pressed="${active}" ${count === 0 ? "disabled" : ""}>
        ${escapeHtml(config.name)}
      </button>
    `;
  }).join("");
}
