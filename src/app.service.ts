import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);
  constructor() {}
  onModuleInit() {
    this.logger.log(JSON.stringify(this.getInfo()));
    if (!process.env.SQLSERVER_RESTORE_DIR)
      this.logger.error('SQLSERVER_RESTORE_DIR is not set');
    if (!process.env.SQLSERVER_DATA_DIR)
      this.logger.error('SQLSERVER_DATA_DIR is not set');
    if (!process.env.DB_USERNAME) this.logger.error('DB_USERNAME is not set');
    if (!process.env.DB_HOST) this.logger.error('DB_HOST is not set');
    if (!process.env.BACKUP_DIR) this.logger.error('BACKUP_DIR is not set');
    if (!process.env.RESTORE_DIR) this.logger.error('RESTORE_DIR is not set');
    if (!process.env.FS_UPLOAD_DIR)
      this.logger.error('FS_UPLOAD_DIR is not set');
    if (!process.env.TOOLS) this.logger.error('TOOLS is not set');
  }
  getNotificationsActive(): boolean {
    return process.env.NOTIFICATIONS_ACTIVE == 'true';
  }
  getInfo() {
    return {
      sqlserver: {
        restoreDir: process.env.SQLSERVER_RESTORE_DIR,
        dataDir: process.env.SQLSERVER_DATA_DIR,
        user: process.env.DB_USERNAME,
        host: process.env.DB_HOST,
        backupDir: process.env.BACKUP_DIR,
      },
      backupmgr: {
        restoreDir: process.env.RESTORE_DIR,
        uploadDir: process.env.FS_UPLOAD_DIR,
        toolsDir: process.env.TOOLS,
      },
    };
  }
  getHello(): string {
    return 'Hello World!';
  }
  getDocRoot(): string {
    return process.env.SUFFIX_URL ?? '';
  }
  getUserLevel(req: Request) {
    return req.session['level'] || null;
  }
}
