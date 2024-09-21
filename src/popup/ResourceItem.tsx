import './index.less';
import { Input, Checkbox, Button, Popconfirm } from 'antd';
import { useState } from 'react';
import { cloneDeep } from 'lodash-es';

function ResourceItem({ data, saveCb }) {
  const [item, setItem] = useState(data || {});

  const onChange = e => {
    if (!item.edit) {
      saveCb({
        ...item,
        enable: e.target.checked,
      });
    }
    updateItem({
      enable: e.target.checked,
    });
  };

  const onSave = (e, type) => {
    e.stopPropagation();
    if (type === 'delete') {
      saveCb(item, 'delete');
      return;
    }
    const _item = cloneDeep(item);
    try {
      new RegExp(_item.matchUrl);
      new RegExp(_item.replaceUrl);
      _item.edit = false;
      _item.error = false;
      saveCb(_item);
      updateItem({
        ..._item,
      });
    } catch (e) {
      console.log(e);
      updateItem({
        error: true,
      });
      return;
    }
  };

  function updateItem(obj = {}) {
    setItem({
      ...item,
      ...obj,
    });
  }

  return (
    <div className="resource-item">
      <div className="resource-item-label">
        <Checkbox checked={item.enable} onChange={onChange}>
          {item.edit ? (
            <Input
              value={item.label}
              placeholder="please input resource name"
              style={{ height: 24, width: 400 }}
              onClick={e => e.stopPropagation()}
              onChange={e => {
                updateItem({
                  label: e.target.value,
                });
              }}
            />
          ) : (
            <span onMouseDown={e => e.preventDefault()}>{item.label}</span>
          )}
        </Checkbox>

        {item.edit ? (
          <div>
            <Button type="text" onClick={e => onSave(e, 'save')}>
              保存
            </Button>
            <Button
              type="text"
              onClick={e => {
                e.stopPropagation();
                updateItem({
                  ...data,
                });
              }}
            >
              取消
            </Button>
          </div>
        ) : (
          <div>
            <Button
              type="text"
              onClick={e => {
                e.stopPropagation();
                updateItem({
                  edit: true,
                });
              }}
            >
              编辑
            </Button>

            <Popconfirm
              title="确定要删除？"
              onConfirm={e => onSave(e, 'delete')}
              okText="删除"
              cancelText="取消"
            >
              <Button type="text" onClick={e => e.stopPropagation()}>
                删除
              </Button>
            </Popconfirm>
          </div>
        )}
      </div>
      <div className="resource-item-value">
        <Input
          onChange={e => {
            updateItem({ matchUrl: e.target.value });
          }}
          prefix="match："
          value={item.matchUrl}
          placeholder="url"
          style={{ marginRight: 4 }}
          disabled={!item.edit}
        />
        <Input
          onChange={e => {
            updateItem({ replaceUrl: e.target.value });
          }}
          prefix="replace："
          value={item.replaceUrl}
          placeholder="url"
          disabled={!item.edit}
        />
      </div>
      {item.error ? (
        <span style={{ color: 'red' }}>
          请输入正确的url 或 正则规则（ 注意:正则规则不要填开头的/和结束的/gi，如/.*/gi请写成.* ）
        </span>
      ) : null}
    </div>
  );
}

export default ResourceItem;
