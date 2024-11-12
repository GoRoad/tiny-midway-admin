import { request } from '@/utils'

const apiPrefix = '/mock/AliossUploader';
export function GetList(query) {
  // return request({
  //   url: apiPrefix + '/page',
  //   method: 'post',
  //   data: query,
  // });

  const img1 = 'https://www.baidu.com/img/bd_logo1.png'
  const img2 = 'https://greper.handsfree.work/extends/avatar.jpg'
  return {
    records:  [
      {
        id: 1,
        cropper: img1,
        pictureCard: [img1, img2],
        file: [img1, img2],
      },
      {
        id: 2,
        cropper: img1,
        pictureCard: [img1, img2],
        file: [img1, img2],
      },
      {
        id: 3,
        cropper: img1,
        pictureCard: [img1, img2],
        file: [img1, img2],
      },
    ],
    total: 3,
  }
}

export function AddObj(obj) {
  return request({
    url: apiPrefix + '/add',
    method: 'post',
    data: obj,
  });
}

export function UpdateObj(obj) {
  return request({
    url: apiPrefix + '/update',
    method: 'post',
    data: obj,
  });
}

export function DelObj(id) {
  return request({
    url: apiPrefix + '/delete',
    method: 'post',
    params: { id },
  });
}

export function GetObj(id) {
  return request({
    url: apiPrefix + '/get',
    method: 'post',
    params: { id },
  });
}
