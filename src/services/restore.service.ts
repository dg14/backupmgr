import { Injectable } from '@nestjs/common';
import { readdirSync, statSync } from 'fs';
import { EntityManager } from 'typeorm';

@Injectable()
export class RestoreService {
  constructor(private entityManager: EntityManager) {}
  async enum() {
    let ret = [];
    for (let f of readdirSync(process.env.RESTORE_DIR)) {
      ret.push({
        file: f,
        stats: statSync(process.env.RESTORE_DIR + '/' + f).mtime,
      });
    }
    return ret;
  }
  async analyze(f: string) {
    try {
      let path = process.env.RESTORE_DB_DIR + '/' + f;
      let ret = await this.entityManager.query(
        `RESTORE FILELISTONLY FROM DISK = N'${path}'`,
      );
      let ret2 = await this.entityManager.query(
        `RESTORE HEADERONLY FROM DISK = N'${path}'`,
      );
      return {
        files: ret,
        header: ret2,
      };
    } catch (e) {
      console.log(e);
      return {};
    }
  }
}
