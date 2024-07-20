import { Injectable } from '@nestjs/common';
import { readdirSync, statSync } from 'fs';
import { EntityManager } from 'typeorm';
import { basename } from 'path';

@Injectable()
export class RestoreService {
  async restore(file: string, name: string) {
    //RESTORE DATABASE TimPeople FROM DISK = N'/backups/TimPeople_backup_2023_05_02_050026_3473094.bak' WITH MOVE 'TimPeopleApp' TO '/var/opt/mssql/data/TimPeople.MDF',MOVE 'TimPeopleApp_Log' TO '/var/opt/mssql/data/TimPeople.LDF'
    let list = await this.analyze(file);
    let source = process.env.SQLSERVER_RESTORE_DIR + '/' + file;
    let moves = [];
    for (let file of list.files) {
      let lname = file.LogicalName;
      let fname = file.PhysicalName;
      if (fname[1] == ':') {
        fname = fname.substring(2).replaceAll("\\", "/")
      };
      moves.push(`MOVE '${lname}' TO '${process.env.SQLSERVER_DATA_DIR}/${basename(fname)}'`);
    }
    let q = `restore database ${name} from disk = N'${source}' with ${moves.join(',')}`;
    let s = await this.entityManager.query(q);
    console.log(s);
    return s;

  }
  constructor(private entityManager: EntityManager) { }
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
      let path = process.env.SQLSERVER_RESTORE_DIR + '/' + f;
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
