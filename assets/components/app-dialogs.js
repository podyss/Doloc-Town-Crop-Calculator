"use strict";

defineTemplateElement("app-dialog-layer", String.raw`
<dialog id="crop-dialog" class="modal">
  <form id="crop-form" method="dialog">
    <div class="modal-header">
      <div>
        <p class="section-label">作物资料</p>
        <h2 id="crop-dialog-title">添加作物</h2>
      </div>
      <button class="icon-button close-dialog" type="button" title="关闭" aria-label="关闭">
        <i data-lucide="x"></i>
      </button>
    </div>
    <input type="hidden" id="crop-id">
    <label class="field full-field">
      <span>作物名称</span>
      <input id="crop-name" name="name" type="text" maxlength="30" required placeholder="例如：小麦">
    </label>
    <div class="form-grid">
      <fieldset class="duration-field">
        <legend>生长时间</legend>
        <input id="crop-mature-value" type="number" min="0.01" step="0.01" required>
        <select id="crop-mature-unit" aria-label="生长时间单位">
          <option value="day">天</option>
          <option value="hour">小时</option>
          <option value="minute">分钟</option>
        </select>
      </fieldset>
      <fieldset class="duration-field">
        <legend>再收获间隔</legend>
        <input id="crop-regrow-value" type="number" min="0" step="0.01" required>
        <select id="crop-regrow-unit" aria-label="再收获间隔单位">
          <option value="day">天</option>
          <option value="hour">小时</option>
          <option value="minute">分钟</option>
        </select>
      </fieldset>
      <label class="field">
        <span>可收获次数</span>
        <div class="input-suffix">
          <input id="crop-harvests" type="number" min="1" step="1" required>
          <span>次</span>
        </div>
      </label>
      <label class="field">
        <span>单次最低产量</span>
        <div class="input-suffix">
          <input id="crop-yield-min" type="number" min="0" step="0.01" required>
          <span>个</span>
        </div>
      </label>
      <label class="field">
        <span>单次最高产量</span>
        <div class="input-suffix">
          <input id="crop-yield-max" type="number" min="0" step="0.01" required>
          <span>个</span>
        </div>
      </label>
      <label class="field full-field">
        <span>作物单价</span>
        <input id="crop-price" type="number" min="0" step="0.01" required>
      </label>
      <label class="field full-field">
        <span>作物类型</span>
        <select id="crop-layout-type" required>
          <option value="generic">通用</option>
          <option value="shrub">灌木</option>
          <option value="vine">藤蔓</option>
          <option value="mushroom">菌类</option>
        </select>
      </label>
      <label class="field">
        <span>种植占地宽度</span>
        <div class="input-suffix">
          <input id="crop-layout-width" type="number" min="1" step="1" required>
          <span>格</span>
        </div>
      </label>
      <label class="field">
        <span>种植占地高度</span>
        <div class="input-suffix">
          <input id="crop-layout-height" type="number" min="1" step="1" required>
          <span>格</span>
        </div>
      </label>
    </div>
    <div class="modal-actions">
      <button class="button ghost-button close-dialog" type="button">取消</button>
      <button class="button primary-button" type="submit">
        <i data-lucide="check"></i>
        保存作物
      </button>
    </div>
  </form>
</dialog>

<dialog id="modifier-dialog" class="modal">
  <form id="modifier-form" method="dialog">
    <div class="modal-header">
      <div>
        <p class="section-label">加成规则</p>
        <h2 id="modifier-dialog-title">添加选项</h2>
      </div>
      <button class="icon-button close-dialog" type="button" title="关闭" aria-label="关闭">
        <i data-lucide="x"></i>
      </button>
    </div>
    <input type="hidden" id="modifier-id">
    <label class="field full-field">
      <span>选项名称</span>
      <input id="modifier-name" type="text" maxlength="40" required placeholder="例如：农业补光灯">
    </label>
    <label class="field full-field category-field">
      <span>所属分类</span>
      <select id="modifier-category" required>
        <option value="equipment">设备</option>
        <option value="building">建筑（最多选择 1 个）</option>
        <option value="fertilizer">肥料（最多选择 1 个）</option>
        <option value="gene">基因（最多选择 3 个）</option>
      </select>
    </label>
    <div class="form-grid modifier-form-grid">
      <label class="field">
        <span>生长速度</span>
        <div class="input-suffix">
          <input id="modifier-speed" type="number" step="1" value="0" required>
          <span>%</span>
        </div>
      </label>
      <label class="field">
        <span>收获次数增量</span>
        <div class="input-suffix">
          <input id="modifier-harvests" type="number" step="1" value="0" required>
          <span>次</span>
        </div>
      </label>
      <label class="field">
        <span>单次产量增量</span>
        <div class="input-suffix">
          <input id="modifier-yield-flat" type="number" step="1" value="0" required>
          <span>个</span>
        </div>
      </label>
      <label class="field">
        <span>单次产量加成</span>
        <div class="input-suffix">
          <input id="modifier-yield-percent" type="number" step="1" value="0" required>
          <span>%</span>
        </div>
      </label>
      <label class="field full-field">
        <span>基础单次产量至少达到</span>
        <div class="input-suffix">
          <input id="modifier-min-yield" type="number" min="0" step="1" value="0" required>
          <span>个（0 为不限）</span>
        </div>
      </label>
    </div>
    <div class="modal-actions">
      <button class="button ghost-button close-dialog" type="button">取消</button>
      <button class="button primary-button" type="submit">
        <i data-lucide="check"></i>
        保存选项
      </button>
    </div>
  </form>
</dialog>

<dialog id="backup-dialog" class="modal small-modal">
  <div class="modal-header">
    <div>
      <p class="section-label">本地数据</p>
      <h2>备份与恢复</h2>
    </div>
    <button class="icon-button close-dialog" type="button" title="关闭" aria-label="关闭">
      <i data-lucide="x"></i>
    </button>
  </div>
  <div class="backup-actions">
    <button class="button secondary-button" id="export-button" type="button">
      <i data-lucide="download"></i>
      导出备份
    </button>
    <button class="button secondary-button" id="import-button" type="button">
      <i data-lucide="upload"></i>
      导入备份
    </button>
    <button class="button danger-button" id="reset-button" type="button">
      <i data-lucide="rotate-ccw"></i>
      恢复默认数据
    </button>
    <input id="import-file" type="file" accept="application/json,.json" hidden>
  </div>
</dialog>

<dialog id="confirm-dialog" class="modal confirm-modal">
  <div class="confirm-icon"><i data-lucide="triangle-alert"></i></div>
  <h2 id="confirm-title">确认删除</h2>
  <p id="confirm-message"></p>
  <div class="modal-actions">
    <button class="button ghost-button" id="confirm-cancel" type="button">取消</button>
    <button class="button danger-button" id="confirm-accept" type="button">确认</button>
  </div>
</dialog>

<div class="toast" id="toast" role="status" aria-live="polite"></div>
`);
