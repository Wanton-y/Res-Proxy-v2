let ReResMap = [];
const typeMap = {
  txt: 'text/plain',
  html: 'text/html',
  css: 'text/css',
  js: 'text/javascript',
  json: 'text/json',
  xml: 'text/xml',
  jpg: 'image/jpeg',
  gif: 'image/gif',
  png: 'image/png',
  webp: 'image/webp',
};

function updateBadge(num) {
  chrome.browserAction.setBadgeText({ text: num.toString() });
}

function getLocalFileUrl(url) {
  const arr = url.split('.');
  const type = arr[arr.length - 1];
  const xhr = new XMLHttpRequest();
  xhr.open('get', url, false);
  xhr.send(null);
  let content = xhr.responseText || xhr.responseXML;
  if (!content) {
    return false;
  }
  content = encodeURIComponent(
    type === 'js'
      ? (content as any).replace(/[\u0080-\uffff]/g, function ($0) {
          const str = $0.charCodeAt(0).toString(16);
          return '\\u' + '00000'.substr(0, 4 - str.length) + str;
        })
      : content,
  );
  return 'data:' + (typeMap[type] || typeMap.txt) + ';charset=utf-8,' + content;
}

chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    let url = details.url;
    for (let i = 0, len = ReResMap.length; i < len; i++) {
      const reg = new RegExp(ReResMap[i].matchUrl, 'gi');
      if (ReResMap[i].enable && typeof ReResMap[i].replaceUrl === 'string' && reg.test(url)) {
        if (!/^file:\/\//.test(ReResMap[i].replaceUrl)) {
          do {
            url = url.replace(reg, ReResMap[i].replaceUrl);
          } while (reg.test(url));
        } else {
          do {
            url = getLocalFileUrl(url.replace(reg, ReResMap[i].replaceUrl));
          } while (reg.test(url));
        }
      }
    }
    return url === details.url ? {} : { redirectUrl: url };
  },
  { urls: ['<all_urls>'] },
  ['blocking'],
);

function getLocalRes() {
  chrome.storage.local.get(['ResMap'], function (result) {
    const res = result.ResMap ? JSON.parse(result.ResMap) : [];
    ReResMap = resFlat(res);
  });
}

getLocalRes();

chrome.storage.onChanged.addListener((changes, areaName) => {
  // 检查区域是否是 'local' 或 'sync'
  if (areaName === 'local' || areaName === 'sync') {
    for (const key in changes) {
      if (key === 'ResMap') {
        const newValue = changes[key].newValue || '';
        ReResMap = resFlat(JSON.parse(newValue) || []);
      }
    }
  }
});

function resFlat(list) {
  if (!list || list.length === 0) {
    updateBadge(0);
    return [];
  }
  const _list = list.map(l => l.resources);
  const res = _list.flat();
  const num = res.filter(l => l.enable).length;
  updateBadge(num);
  return res;
}
