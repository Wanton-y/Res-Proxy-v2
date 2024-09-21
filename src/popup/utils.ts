export function setRes(data) {
  chrome.storage.local.set({ ResMap: JSON.stringify(data) });
}

export function getRes(get) {
  chrome.storage.local.get(['ResMap'], function (result) {
    const res = result.ResMap ? JSON.parse(result.ResMap) : [];
    get(res);
  });
}

// 导出
export function exportFile() {
  getRes(res => {
    const blob = new Blob([JSON.stringify(res, null, '\t')], { type: 'text/json' });
    const _link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    _link.href = url;
    _link.download = 'res-proxy.bak.json';
    document.body.appendChild(_link);
    _link.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(_link);
  });
}

// 导入
export function importFile(file) {
  if (file) {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function () {
      try {
        const data = typeof reader.result === 'string' ? JSON.parse(reader.result) : '';
        if (data && Array.isArray(data)) {
          setRes(data);
          // location.reload();
        } else {
          alert('导入失败，请检查文件内容格式正确性');
        }
      } catch (e) {
        console.log(e);
        alert('导入失败，请检查文件格式是否正确');
      }
    };
  }
}
