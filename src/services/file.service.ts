import { Injectable } from '@nestjs/common';
import {
  readdirSync,
  statSync,
  renameSync,
  unlinkSync,
  writeFileSync,
  existsSync,
  realpathSync,
} from 'node:fs';
import { resolve } from 'path';
@Injectable()
export class FileService {
  removeFile(id: string) {
    let root = process.env.FS_UPLOAD_DIR;
    let f = root + '/' + id;
    if (existsSync(f)) unlinkSync(f);
  }
  pushFile(file: Express.Multer.File) {
    let root = process.env.FS_UPLOAD_DIR;
    writeFileSync(root + '/' + file.originalname, file.buffer);
  }
  moveToRestore(id: string) {
    let root = process.env.FS_UPLOAD_DIR;
    let filePath = realpathSync(resolve(root, id));
    if (!filePath.startsWith(root)) {
      throw Error('Problems with security');
    }
    renameSync(root + '/' + id, process.env.RESTORE_DIR + '/' + id);
  }
  getFiles() {
    let root = process.env.FS_UPLOAD_DIR;
    let list = readdirSync(root);
    let ret = [];
    for (let file of list) {
      let f = root + '/' + file;
      let stats = statSync(f);
      ret.push({
        file: file,
        size: stats.size,
        modifiedAt: new Date(stats.mtime),
        createdAt: new Date(stats.ctime),
      });
    }
    return ret;
  }
}
