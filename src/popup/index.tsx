import { Button, Collapse, Input, Tooltip, Badge } from 'antd';
import { useMemo, useState, useCallback, useEffect } from 'react';
import './index.less';
import ResourceItem from './ResourceItem';
import { cloneDeep } from 'lodash-es';
import { setRes, getRes, exportFile } from './utils';
import {
  EditOutlined,
  CloseOutlined,
  CheckOutlined,
  CloudDownloadOutlined,
} from '@ant-design/icons';

const resource = {
  matchUrl: `.*match.url.js`,
  replaceUrl: 'https://replace.url.js',
  enable: false,
  edit: false,
  error: false,
};

const template = {
  edit: false,
  resources: [],
};

function Popup() {
  const [editGroupName, setEditGroupName] = useState<any>(undefined);
  const [activeKey, setActiveKey] = useState(undefined);

  const [data, setData] = useState([]);

  useEffect(() => {
    getRes(res => {
      setData(res);
      setActiveKey([res?.[0]?.groupId]);
    });
  }, []);

  const onEdit = useCallback(
    (e, item, type, value?: string) => {
      e.stopPropagation();
      const _index = data.findIndex(d => d.groupId === item.groupId);
      const _data = cloneDeep(data);
      if (type === 'edit') {
        setEditGroupName(item.groupName);
        _data[_index].edit = true;
      } else if (type === 'cancel') {
        _data[_index].edit = false;
        setEditGroupName('');
      } else {
        _data[_index].edit = false;
        _data[_index].groupName = value;
        setEditGroupName('');
      }
      setData(_data);
    },
    [data],
  );

  const countEnableRes = useCallback(item => {
    return item.resources.filter(d => d.enable).length;
  }, []);

  const saveCb = useCallback(
    (item, resource, editData, type?: string) => {
      const _data = cloneDeep(data);
      const _g_index = _data.findIndex(d => d.groupId === item.groupId);
      const _list = _data[_g_index].resources;
      const _r_index = _list.findIndex(d => d.id === resource.id);
      if (type === 'delete') {
        _list.splice(_r_index, 1);
      } else {
        const newRes = {
          ..._list[_r_index],
          ...editData,
        };
        _list[_r_index] = newRes;
      }
      _data[_g_index].resources = _list;
      setData(_data);
      setRes(_data);
    },
    [data],
  );

  const items = useMemo(() => {
    return data.map((item, index) => {
      return {
        key: item.groupId,
        label: (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              height: 28,
              alignItems: 'center',
            }}
          >
            <div>
              {item.edit ? (
                <>
                  <Input
                    value={editGroupName}
                    placeholder="please input groupName"
                    style={{ height: 28, width: 400 }}
                    onClick={e => e.stopPropagation()}
                    onChange={e => {
                      setEditGroupName(e?.target?.value);
                    }}
                  />
                  <Button
                    type="text"
                    icon={<CheckOutlined />}
                    size="small"
                    onClick={e => onEdit(e, item, 'save', editGroupName)}
                  ></Button>
                  <Button
                    type="text"
                    icon={<CloseOutlined />}
                    size="small"
                    onClick={e => onEdit(e, item, 'cancel', editGroupName)}
                  ></Button>
                </>
              ) : (
                <div>
                  <Badge count={countEnableRes(item)} size="small" offset={[6, -2]}>
                    <span onMouseDown={e => e.preventDefault()}>{item.groupName}</span>
                  </Badge>
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    size="small"
                    style={{ marginLeft: 8 }}
                    onClick={e => {
                      onEdit(e, item, 'edit');
                    }}
                  ></Button>
                </div>
              )}
            </div>
            {!item.edit ? (
              <div>
                <Button
                  type="text"
                  style={{ width: 40 }}
                  onClick={e => {
                    e.stopPropagation();
                    const _data = cloneDeep(data);
                    _data[index].resources.push({
                      ...resource,
                      label: `resource-${new Date().getTime()}`,
                      id: `resource-${new Date().getTime()}`,
                    });
                    setData(_data);
                    setRes(_data);
                    setActiveKey([item.groupId]);
                  }}
                >
                  添加
                </Button>
                {data[index].resources.length !== 0 ? (
                  <Tooltip title="请先清空分组内资源代理">
                    <Button type="text" disabled style={{ width: 40 }}>
                      删除
                    </Button>
                  </Tooltip>
                ) : (
                  <Button
                    type="text"
                    style={{ width: 40 }}
                    onClick={e => {
                      e.stopPropagation();
                      const _data = cloneDeep(data);
                      _data.splice(index, 1);
                      setData(_data);
                      setRes(_data);
                    }}
                  >
                    删除
                  </Button>
                )}
              </div>
            ) : null}
          </div>
        ),
        children: item.resources.map(resource => {
          return (
            <ResourceItem
              key={resource.id}
              data={resource}
              saveCb={(editData, type) => saveCb(item, resource, editData, type)}
            />
          );
        }),
      };
    });
  }, [data, onEdit, editGroupName, saveCb, countEnableRes]);

  return (
    <div className="res-proxy-popup">
      <div className="res-proxy-popup-header">
        <Button
          size="small"
          onClick={() => {
            const _data = [
              ...data,
              {
                ...template,
                groupName: `group-${new Date().getTime()}`,
                groupId: new Date().getTime(),
              },
            ];
            setData(_data);
            setRes(_data);
          }}
        >
          添加分组
        </Button>
        <div>
          <Button
            icon={<CloudDownloadOutlined />}
            size="small"
            style={{ marginRight: 4 }}
            onClick={() => exportFile()}
          >
            导出
          </Button>
          {/* <Upload
            accept=".json"
            maxCount={1}
            showUploadList={false}
            onChange={e => {
              importFile(e?.file?.originFileObj);
            }}
          >
            <Button icon={<CloudUploadOutlined />}>导入</Button>
          </Upload> */}
        </div>
      </div>
      <Collapse
        activeKey={activeKey}
        size="small"
        bordered={false}
        items={items}
        accordion
        onChange={key => setActiveKey(key)}
      />
    </div>
  );
}

export default Popup;
