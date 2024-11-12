import * as api from './api';
export default function ({ expose }) {
  const pageRequest = async (query) => {
    return await api.GetList(query);
  };
  const editRequest = async ({ form, row }) => {
    if (form.id == null) {
      form.id = row.id;
    }
    return await api.UpdateObj(form);
  };
  const delRequest = async ({ row }) => {
    return await api.DelObj(row.id);
  };

  const addRequest = async ({ form }) => {
    return await api.AddObj(form);
  };

  return {
    crudOptions: {
      request: {
        pageRequest,
        addRequest,
        editRequest,
        delRequest,
      },
      columns: {
        id: {
          title: 'ID',
          key: 'id',
          type: 'number',
          column: {
            width: 50,
          },
          form: {
            show: false,
          },
        },
        file: {
          title: '阿里云上传（普通文件）',
          type: 'file-uploader',
          form: {
            component: {
              uploader: {
                type: 'alioss',
              },
            },
          },
        },
        pictureCard: {
          title: '服务器上传（照片墙）',
          type: 'image-uploader',
          form: {
            component: {
              limit: 1,
              uploader: {
                type: 'form',
                // category: 'picture-card',
              },
            },
            helper: '最大可上传1个文件',
          },
          column: {
            component: {
              buildPreviewUrl({ url, index }) {
                if (index === 0) {
                  return 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png';
                } else {
                  return url + '?preview=600x600';
                }
              },
            },
          },
        },
        cropper: {
          title: '腾讯云上传（裁剪图片）',
          type: 'cropper-uploader',
          form: {
            component: {
              uploader: {
                type: 'cos',
              },
            },
          },
        },
      },
    },
  };
}
