import { savePropertyMetadata } from '@midwayjs/core';

export const ACCESS_META_KEY = 'access:code';

export function Access(code: string): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    // console.log('descriptor: ', descriptor);
    // 只保存元数据
    savePropertyMetadata(ACCESS_META_KEY, code, target, propertyKey);
  };
}
