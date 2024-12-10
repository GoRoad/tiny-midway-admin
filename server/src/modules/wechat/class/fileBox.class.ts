// 借鉴（抄） https://github.com/mikoshu/gewechaty/

import { join, basename } from 'path';
import * as fs from 'fs';

const tempname: string = '_gewetemp';
const staticUrl: string = 'static';
const proxyUrl: string = '';

const getFileNameFromUrl = (link: string): string => {
  return link.split('/').pop() || '';
};

const joinURL = (...parts: string[]): string => {
  const validParts = parts
    .filter(part => part)
    .map(part => part.replace(/^\/+|\/+$/g, ''));
  return validParts.join('/');
};

export class Filebox {
  url: string;
  type: string;
  name: string;

  constructor() {
    this.url = '';
    this.type = '';
    this.name = '';
  }

  static fromUrl(url: string, forceType: string = ''): Filebox {
    const supportType: string[] = ['image', 'file'];
    const type: string = forceType || Filebox.getFileType(url);
    if (!supportType.includes(type)) {
      throw new Error(
        'Filebox只支持图片和文件类型，语音和视频使用 new Audio() 或 new Video() 来创建'
      );
    }
    const instance: Filebox = new Filebox();
    instance.type = type;
    instance.url = url;
    instance.name = getFileNameFromUrl(url);
    return instance;
  }

  static fromFile(filepath: string, time: number = 1000 * 60 * 5): Filebox | undefined {
    try {
      const tempDir: string = join(staticUrl, tempname);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }
      const fileName: string = basename(filepath);
      const destPath: string = join(tempDir, fileName);
      fs.copyFileSync(filepath, destPath);
      const url: string = joinURL(proxyUrl, tempname, fileName);
      const t: NodeJS.Timeout = setTimeout(() => {
        fs.unlink(destPath, (err: NodeJS.ErrnoException | null) => {
          if (err) {
            console.error('删除文件时出错:', err);
          } else {
            console.log(`文件 ${destPath} 已删除`);
          }
        });
        clearTimeout(t);
      }, time);
      return Filebox.fromUrl(url);
    } catch (err) {
      console.error('复制文件时出错:', err);
      return undefined;
    }
  }

  static toDownload(url: string, type: string, name: string): Filebox {
    const instance: Filebox = new Filebox();
    if (!type) {
      type = Filebox.getFileType(url);
    }
    if (!name) {
      name = getFileNameFromUrl(url);
    }
    instance.type = type;
    instance.url = url;
    instance.name = name;
    return instance;
  }

  toFile(dest: string): void {
    // return downloadFile(this.url, dest)
  }

  static getFileType(fileName: string): string {
    const extension: string = fileName.split('.').pop()?.toLowerCase() || '';
    const imageExtensions: string[] = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const videoExtensions: string[] = ['mp4'];
    const audioExtensions: string[] = ['mp3', 'wav', 'aac', 'flac', 'ogg', 'wma'];
    const documentExtensions: string[] = [
      'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'zip', 'rar'
    ];
    if (imageExtensions.includes(extension)) {
      return 'image';
    } else if (videoExtensions.includes(extension)) {
      return 'video';
    } else if (audioExtensions.includes(extension)) {
      return 'audio';
    } else if (documentExtensions.includes(extension)) {
      return 'file';
    } else {
      return 'unknown';
    }
  }
}