"use strict";

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
