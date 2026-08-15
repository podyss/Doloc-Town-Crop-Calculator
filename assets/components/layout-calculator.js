"use strict";

defineTemplateElement("layout-calculator-view", String.raw`
<main class="layout-page" id="layout-view" role="tabpanel" aria-labelledby="layout-view-tab" hidden>
  <section class="layout-controls" aria-labelledby="layout-heading">
    <div class="layout-title-row">
      <div>
        <p class="section-label">建筑布局</p>
        <h2 id="layout-heading">室内种植规划</h2>
      </div>
      <div class="building-switch" role="group" aria-label="选择建筑">
        <button class="building-option active" type="button" data-building-id="plant-greenhouse">植物大棚</button>
        <button class="building-option" type="button" data-building-id="greenhouse">温室</button>
      </div>
    </div>

    <div class="layout-tool-row">
      <div class="layout-crop-picker-control">
        <span id="layout-crop-picker-label">作物</span>
        <div class="layout-crop-picker" id="layout-crop-picker">
          <button class="layout-crop-trigger" id="layout-crop-trigger" type="button" aria-haspopup="listbox" aria-expanded="false" aria-controls="layout-crop-picker-panel" aria-labelledby="layout-crop-picker-label layout-crop-selected-name">
            <span class="layout-crop-trigger-copy">
              <strong id="layout-crop-selected-name">末芋</strong>
              <small id="layout-crop-selected-meta">通用 · 2 × 2</small>
            </span>
            <i data-lucide="chevron-down"></i>
          </button>
          <div class="layout-crop-picker-panel" id="layout-crop-picker-panel" hidden>
            <label class="layout-crop-search">
              <i data-lucide="search"></i>
              <input id="layout-crop-search" type="search" placeholder="搜索作物" autocomplete="off" aria-label="搜索作物">
            </label>
            <div class="layout-crop-filters" id="layout-crop-filters" role="group" aria-label="按作物类型筛选"></div>
            <div class="layout-crop-options" id="layout-crop-options" role="listbox" aria-label="作物"></div>
          </div>
        </div>
      </div>
      <label class="layout-processing-control">
        <span>加工</span>
        <select id="layout-processing-select" aria-label="选择当前作物的加工方式">
          <option value="">直接出售</option>
        </select>
      </label>
      <label class="layout-fertilizer-control">
        <span>肥料</span>
        <select id="layout-fertilizer-select" aria-label="选择布局使用的肥料">
          <option value="">不使用</option>
        </select>
      </label>
      <div class="tool-palette" role="group" aria-label="布局工具">
        <button class="tool-button active" type="button" data-layout-tool="crop" aria-pressed="true">
          <i data-lucide="sprout"></i>
          作物
        </button>
        <button class="tool-button" type="button" data-layout-tool="sprinkler" aria-pressed="false">
          <i data-lucide="waves"></i>
          电力洒水器
        </button>
        <button class="tool-button" type="button" data-layout-tool="grow-light" aria-pressed="false">
          <i data-lucide="sun"></i>
          农业补光灯
        </button>
        <button class="tool-button" type="button" data-layout-tool="eraser" aria-pressed="false">
          <i data-lucide="eraser"></i>
          擦除
        </button>
      </div>
      <div class="layout-actions">
        <button class="icon-button danger-icon" id="clear-layout" type="button" title="清空当前建筑布局" aria-label="清空当前建筑布局">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
    </div>

    <div class="building-facts" aria-label="建筑和设备数据">
      <span><strong id="layout-interior-size">26 × 7</strong> 室内</span>
      <span><strong id="layout-main-size">15 × 5</strong> 主体</span>
      <span><strong id="layout-building-speed">+20%</strong> 建筑速度</span>
      <span><strong id="layout-crop-container">通用</strong> 作物类型</span>
      <span><strong id="layout-tool-size">2 × 2</strong> 当前占格</span>
      <span id="layout-tool-coverage"><strong>无</strong> 覆盖</span>
    </div>
  </section>

  <section class="layout-results" aria-label="布局计算结果">
    <div class="layout-result-item">
      <span>建筑日产量</span>
      <strong id="layout-daily-yield">0 个</strong>
      <small id="layout-crop-status">有效 0 / 已种 0 个</small>
    </div>
    <div class="layout-result-item layout-result-accent">
      <span>建筑日产值</span>
      <strong id="layout-daily-value">0</strong>
      <small id="layout-daily-value-detail">按各作物所选出售方式</small>
    </div>
    <div class="layout-result-item">
      <span>主体每格日产值</span>
      <strong id="layout-main-cell-value">0</strong>
      <small id="layout-main-cell-detail">按 75 格建筑占地</small>
    </div>
    <div class="layout-result-item">
      <span>室内每格日产值</span>
      <strong id="layout-interior-cell-value">0</strong>
      <small id="layout-interior-cell-detail">按 182 格室内面积</small>
    </div>
    <div class="layout-result-item">
      <span>设备与覆盖</span>
      <strong id="layout-equipment-count">0 台</strong>
      <small id="layout-coverage-status">浇灌 0 · 补光 0 个</small>
    </div>
  </section>

  <section class="layout-editor" aria-label="布局编辑器">
    <div class="layout-board-area">
      <div class="layout-board-heading">
        <div>
          <p class="section-label">室内网格</p>
          <h3 id="layout-building-name">植物大棚 · 26 × 7</h3>
        </div>
        <div class="layout-legend" aria-label="图例">
          <span><i class="legend-swatch crop-swatch"></i>作物</span>
          <span><i class="legend-swatch water-swatch"></i>浇灌</span>
          <span><i class="legend-swatch light-swatch"></i>补光</span>
        </div>
      </div>
      <div class="layout-board-scroll">
        <div class="layout-grid" id="layout-grid" role="grid" aria-label="建筑室内布局网格"></div>
      </div>
    </div>

    <aside class="layout-breakdown" aria-labelledby="layout-breakdown-heading">
      <div class="layout-breakdown-heading">
        <div>
          <p class="section-label">作物明细</p>
          <h3 id="layout-breakdown-heading">日产构成</h3>
        </div>
      </div>
      <div class="layout-breakdown-table" id="layout-breakdown-table"></div>
    </aside>
  </section>
</main>
`);
