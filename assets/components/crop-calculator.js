"use strict";

defineTemplateElement("crop-calculator-view", String.raw`
<div class="result-dock crop-view-section" id="crop-result-view">
  <div class="result-strip" id="result-strip" aria-label="计算结果">
    <div class="result-item">
      <span>首次成熟</span>
      <strong id="result-first">4天</strong>
      <small id="result-first-minutes">5,760 分钟</small>
    </div>
    <div class="result-item">
      <span>完成周期</span>
      <strong id="result-total-time">4天</strong>
      <small id="result-harvest-count">共 1 次</small>
    </div>
    <div class="result-item">
      <span>总产量</span>
      <strong><span id="result-total-yield">3</span> 个</strong>
      <small id="result-yield-detail">每次 3 个</small>
    </div>
    <div class="result-item result-accent">
      <span>平均日产量</span>
      <strong><span id="result-daily-yield">0.75</span> 个</strong>
      <small>按完整周期折算</small>
    </div>
  </div>
</div>

<div class="app-shell crop-view-section" id="crop-view" role="tabpanel" aria-labelledby="crop-view-tab">
  <aside class="crop-panel" aria-label="作物列表">
    <div class="panel-heading">
      <div>
        <p class="section-label">作物</p>
        <span class="item-count" id="crop-count">0 种</span>
      </div>
      <button class="icon-button primary-icon" id="add-crop-button" type="button" title="添加作物" aria-label="添加作物">
        <i data-lucide="plus"></i>
      </button>
    </div>
    <div class="crop-category-switch crop-panel-categories" id="crop-category-tabs" role="group" aria-label="按作物类型筛选"></div>
    <div class="crop-list" id="crop-list"></div>
  </aside>

  <main class="workspace">
    <section class="crop-summary" aria-labelledby="selected-crop-name">
      <div class="summary-heading">
        <div>
          <p class="section-label">当前作物</p>
          <h2 id="selected-crop-name">小麦</h2>
        </div>
        <div class="row-actions">
          <button class="icon-button" id="edit-crop-button" type="button" title="编辑作物" aria-label="编辑作物">
            <i data-lucide="pencil"></i>
          </button>
          <button class="icon-button danger-icon" id="delete-crop-button" type="button" title="删除作物" aria-label="删除作物">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </div>
    </section>

    <section class="value-section" aria-labelledby="value-heading">
      <div class="section-heading value-heading">
        <div>
          <p class="section-label">产值</p>
          <h2 id="value-heading">出售与加工</h2>
        </div>
        <label class="processing-control">
          <span>加工</span>
          <select id="processing-option">
            <option value="">直接出售</option>
          </select>
          <small id="processing-route">不经过加工设备</small>
        </label>
      </div>
      <div class="value-grid">
        <div class="value-item">
          <span>最终产物</span>
          <strong id="value-product">小麦</strong>
        </div>
        <div class="value-item">
          <span>最终单价</span>
          <strong id="value-unit-price">55</strong>
        </div>
        <div class="value-item">
          <span>最终产量</span>
          <strong id="value-yield">3 个</strong>
        </div>
        <div class="value-item">
          <span id="value-time-label">达到理论产能耗时</span>
          <strong id="value-total-time">4天</strong>
        </div>
        <div class="value-item value-emphasis">
          <span>最终产值</span>
          <strong id="value-total">165</strong>
        </div>
        <div class="value-item value-emphasis">
          <span>起步期日均产值</span>
          <strong id="value-startup-daily">41.25/天</strong>
        </div>
        <div class="value-item value-emphasis">
          <span>理论最大日均产值</span>
          <strong id="value-daily">41.25/天</strong>
        </div>
      </div>
      <div class="formula value-formula" id="value-formula">直接出售：3 × 55 = 165；165 ÷ 4天 = 41.25/天</div>
    </section>

    <section class="modifier-section" aria-labelledby="modifier-heading">
      <div class="section-heading">
        <div>
          <p class="section-label">当前方案</p>
          <h2 id="modifier-heading">加成选项</h2>
        </div>
        <div class="modifier-total" id="modifier-total">总速度 +0%</div>
        <button class="button secondary-button" id="add-modifier-button" type="button">
          <i data-lucide="plus"></i>
          添加选项
        </button>
      </div>
      <div class="modifier-list" id="modifier-list"></div>
    </section>

    <section class="details-section" aria-labelledby="details-heading">
      <div class="section-heading compact-heading">
        <div>
          <p class="section-label">结果核对</p>
          <h2 id="details-heading">计算明细</h2>
        </div>
      </div>
      <div class="detail-grid">
        <div class="detail-row">
          <span>速度倍率</span>
          <strong id="detail-speed">1.00 倍</strong>
        </div>
        <div class="detail-row">
          <span>再收获间隔</span>
          <strong id="detail-regrow">1天</strong>
        </div>
        <div class="detail-row">
          <span>收获次数</span>
          <strong id="detail-harvests">1 次</strong>
        </div>
        <div class="detail-row">
          <span>单次产量</span>
          <strong id="detail-yield">3 个</strong>
        </div>
        <div class="detail-row">
          <span>总产量</span>
          <strong id="detail-total-yield">3 个</strong>
        </div>
        <div class="detail-row">
          <span>平均每天产量</span>
          <strong id="detail-daily-yield">0.75 个/天</strong>
        </div>
      </div>
      <div class="formula" id="formula">时间：5,760 ÷ (1 + 0%) = 5,760 分钟</div>
      <div class="formula yield-formula" id="yield-formula">日产量：3 ÷ (5,760 ÷ 1,440) = 0.75 个/天</div>
    </section>
  </main>
</div>
`);
