import { Injectable } from '@nestjs/common';
import { Job } from '../job/job';
import { writeFileSync, unlinkSync } from 'fs';

import { execSync } from 'child_process';
import { tmpdir } from 'node:os';
import { randomBytes } from 'node:crypto';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Sizemon } from '../utils/sizemon.entity';

@Injectable()
export class JSQLHelper {
  constructor(
    @InjectRepository(Sizemon) private sizemonRepository: Repository<Sizemon>,
    private entityManager: EntityManager,
  ) {}
  genTmpFile(ext: string) {
    return tmpdir() + '/' + randomBytes(16).toString('hex') + ext;
  }
  run(job: Job): string {
    // Genera lo script temporaneo
    switch (job.type) {
      case 'sql': {
        const nomeScript = this.genTmpFile('.sql');
        const contenutoScript = job.script.replaceAll(
          '@BACKUPDIR@',
          process.env.BACKUP_DIR,
        );
        writeFileSync(nomeScript, contenutoScript);
        const output = execSync(
          `${process.env.TOOLS}/sqlcmd -C -i ${nomeScript}`,
          {
            env: {
              SQLCMDUSER: process.env.DB_USERNAME,
              SQLCMDPASSWORD: process.env.DB_PASSWORD,
              SQLCMDSERVER: process.env.DB_HOST,
            },
          },
        );

        // Rimuove il file temporaneo
        unlinkSync(nomeScript);
        return output.toString();
      }

      case 'sh': {
        const nomeScript = this.genTmpFile('.sh');
        const contenutoScript = job.script
          .replaceAll('@BACKUPDIR@', process.env.BACKUP_DIR)
          .replaceAll('\r\n', '\n');
        writeFileSync(nomeScript, contenutoScript);
        const output = execSync(`/bin/sh ${nomeScript}`, {
          env: {
            SQLCMDUSER: process.env.DB_USERNAME,
            SQLCMDPASSWORD: process.env.DB_PASSWORD,
            SQLCMDSERVER: process.env.DB_HOST,
          },
        });

        // Rimuove il file temporaneo
        unlinkSync(nomeScript);
        return output.toString();
      }
      default:
        throw new Error('Not implemented');
    }
  }
  async fetchSizes() {
    let list = await this.entityManager.query(`
      SELECT 
	CAST( GETDATE() AS Date ) as date,
      database_name = DB_NAME(database_id)
    , log_size_mb = CAST(SUM(CASE WHEN type_desc = 'LOG' THEN size END) * 8. / 1024 AS DECIMAL(8,2))
    , row_size_mb = CAST(SUM(CASE WHEN type_desc = 'ROWS' THEN size END) * 8. / 1024 AS DECIMAL(8,2))
    , total_size_mb = CAST(SUM(size) * 8. / 1024 AS DECIMAL(8,2))
FROM sys.master_files WITH(NOWAIT)
GROUP BY database_id`);
    console.log(list);
    let excluded = ['master', 'msdb', 'tempdb', 'model'];
    for (let record of list) {
      if (excluded.indexOf(record.database_name) != -1) {
        let n = new Sizemon();
        n.database_name = record.database_name;
        n.log_size_mb = record.log_size_mb;
        n.row_size_mb = record.row_size_mb;
        n.total_size_mb = record.total_size_mb;
        n.date = record.date;
        await this.sizemonRepository.save(n);
      }
    }
  }
}
