"use strict";

defineTemplateElement("app-header-shell", String.raw`
<header class="app-header">
  <div>
    <p class="eyebrow">
      <span>种植规划</span>
      <a class="author-credit" href="https://www.bilibili.com/opus/1236483941697847304" target="_blank" rel="noopener noreferrer">作者 · B站用户 podys</a>
    </p>
    <h1>种植规划计算器</h1>
  </div>
  <nav class="view-tabs" role="tablist" aria-label="计算器视图">
    <button class="view-tab active" id="crop-view-tab" type="button" role="tab" aria-selected="true" aria-controls="crop-view" data-view="crop">
      <i data-lucide="calculator"></i>
      作物计算
    </button>
    <button class="view-tab" id="layout-view-tab" type="button" role="tab" aria-selected="false" aria-controls="layout-view" data-view="layout">
      <i data-lucide="grid-3x3"></i>
      布局计算
    </button>
  </nav>
  <div class="header-actions">
    <span class="save-status" id="save-status" role="status">已保存</span>
    <button class="icon-button" id="backup-button" type="button" title="备份与恢复" aria-label="备份与恢复">
      <i data-lucide="database-backup"></i>
    </button>
  </div>
</header>
`);
