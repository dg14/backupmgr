import { Injectable } from '@nestjs/common';
import { Job } from '../job/job';
import { writeFileSync, unlinkSync } from 'fs';

import { execSync } from 'child_process';
import { tmpdir } from 'node:os';
import { randomBytes } from 'node:crypto';
import { EntityManager } from 'typeorm';

@Injectable()
export class JSQLHelper {
  constructor(private entityManager: EntityManager) {}
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
          `${process.env.TOOLS}/sqlcmd -i ${nomeScript}`,
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

      case 'sh':
        {
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
        break;
      default:
        throw new Error('Not implemented');
    }
  }
}
