import { Controller, Get, Render, Req, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { AppService } from 'src/app.service';
import { Sizemon } from 'src/models/utils/sizemon.entity';
import { AuthGuard } from 'src/services/authguard.service';
import { EntityManager, Repository } from 'typeorm';

@Controller('dbsizes')
export class SizesController {
  constructor(
    @InjectRepository(Sizemon) private sizeRepository: Repository<Sizemon>,
    private entityManager: EntityManager,
    private readonly appService: AppService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  @Render('dbs_list')
  async getDbs(@Req() req: Request) {
    let dbs = await this.entityManager.query(
      'SELECT name FROM master.sys.databases',
    );
    return {
      dbs: dbs,
      level: this.appService.getUserLevel(req),
      DOCROOT: this.appService.getDocRoot(),
    };
  }

  @Get('size/:id')
  @Render('dbs_size')
  @UseGuards(AuthGuard)
  async getDbSize(@Req() req: Request) {
    let id = req.params['id'];
    let days = -21;
    let list = await this.entityManager.query(
      `SELECT date,AVG(total_size_mb) AS total_size_mb , AVG(log_size_mb) AS log_size_mb, AVG(row_size_mb) AS row_size_mb FROM sizemon WHERE date >= DATEADD(DAY, ${days}, GETDATE()) AND database_name='${id}' GROUP BY date ORDER BY date;`,
    );
    return {
      database: id,
      sizes: list,
      level: this.appService.getUserLevel(req),
      DOCROOT: this.appService.getDocRoot(),
    };
  }
}
