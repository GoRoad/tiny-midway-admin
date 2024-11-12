import { Inject, Controller, Post, Get, Del, Files, Fields, Body, Param } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { FileService } from '../service/file.service';
import { JwtPassportMiddleware } from '../../../middleware/jwt.middleware';
import { UploadMiddleware, UploadStreamFileInfo, UploadStreamFieldInfo } from '@midwayjs/busboy';
// import { AdminErrorEnum } from '../../../error/admin.error';

// import { tmpdir } from 'os';
import { promises, existsSync, mkdirSync, createWriteStream, unlink } from 'fs';
import { join, extname } from 'path';

@Controller('/base/file', { middleware: [JwtPassportMiddleware] })
export class FileController {
  @Inject()
  ctx: Context;
  @Inject()
  fileService: FileService;


  // 后台配置的字典
  @Post('/upload', { middleware: [UploadMiddleware] })
  async upload(
    @Files() fileIterator: AsyncGenerator<UploadStreamFileInfo>,
    @Fields() fieldIterator: AsyncGenerator<UploadStreamFieldInfo>
  ) {
    const filePromises = [];
    let categoryId = 1;
    // 遍历所有文件
    for await (const file of fileIterator) {
      const root = process.cwd();
      const { filename, data } = file;
      const decodedFileName = decodeURIComponent(filename);
      // 获取文件扩展名
      const fileEx = extname(decodedFileName);
      // 创建时间目录
      const t = new Date();
      const year = t.getFullYear();
      const month = t.getMonth() + 1;
      const day = t.getDate();
      const dateDir = `${year}_${month}_${day}`;
      const datePath = join(root, 'download', dateDir);
      const _filename = `${t.valueOf()}${fileEx}`;
      // 确保日期目录存在
      if (!existsSync(datePath)) {
        mkdirSync(datePath, { recursive: true });
      }
      const p = join(datePath, _filename);
      const stream = createWriteStream(p);
      data.pipe(stream);

      // 创建一个 Promise 来等待文件写入完成
      const filePromise = new Promise((resolve, reject) => {
        stream.on('finish', async () => {
          const stats = await promises.stat(p);
          const _path = `/${dateDir}/${_filename}`;
          const data = {
            fileName: decodedFileName,
            filePath: _path,
            mimeType: file.mimeType,
            categoryId,
            size: stats.size,
            source: 'local',
            userId: this.ctx.state.user.id, // 上传者 ID
            remark: '',
          };
          const res = await this.fileService.createFile(data)
            .catch(async (err) => {
              await unlink(p, () => {});
              reject(err);
            });
          resolve(res);
        });
        stream.on('error', (err) => {
          reject(err);
        });
      });

      filePromises.push(filePromise);
    }
    // 注意顺序，先读取文件流，然后再处理表单字段
    // 遍历所有参数字段
    for await (const { name, value } of fieldIterator) {
      if (name === 'categoryId') categoryId = +value;
    }
    // 等待所有文件写入完成
    const uploadedFiles = await Promise.all(filePromises);
    return uploadedFiles;
  }

  @Post('/page')
  public async page() {
    const { body } = this.ctx.request as any;
    const { sort = JSON.stringify({ id: 'desc' }), currentPage = 1, pageSize = 20, ...where } = body;
    const filteredWhere = Object.entries(where).reduce((acc, [key, value]) => {
      // 过滤非法值
      const invalidValue = value === undefined || value === null || value === '';
      if (invalidValue) return acc;
      // 判断是否有模糊查询的字段
      if (typeof value === 'string' && value.endsWith('%')) {
        acc[key] = { contains: value.slice(0, -1) };
      } else {
        acc[key] = value;
      }
      return acc;
    }, {});
    return await this.fileService.findAll(filteredWhere, {
      sort: JSON.parse(sort as string),
      page: Number(currentPage),
      limit: Number(pageSize),
    });
  }

  @Get('/types')
  async getTypes() {
    return this.fileService.getTypes();
  }

  @Post('/types')
  async addType(@Body() data: any) {
    return this.fileService.addType(data.name);
  }

  @Del('/types/:id')
  async delType(@Param('id') id: string) {
    return this.fileService.delType(+id);
  }

  @Post('/del')
  async delFile(@Body('ids') ids: string[]) {
    const arr = ids.map(id => +id)
    return this.fileService.delFile(arr);
  }
}
