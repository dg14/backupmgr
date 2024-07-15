import { Controller, Get, Query, Render, Req, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { AppService } from 'src/app.service';
import { AuthGuard } from 'src/authguard.service';
import { Jobinstance } from 'src/models/jobinstance/jobinstance';
import { Repository } from 'typeorm';

@Controller('jobinstances')
export class JobinstanceController {
  constructor(
    @InjectRepository(Jobinstance)
    private jobinstanceRepository: Repository<Jobinstance>,
    private appService: AppService,
  ) {}

  @Get('list')
  @UseGuards(AuthGuard)
  @Render('jobinstance_list')
  async getallJobs(@Query('page') page: number = 1) {
    let perPage = 20;
    if (!page) page = 1;
    let offset = (page - 1) * perPage;
    let count = await this.jobinstanceRepository.count();
    let data = await this.jobinstanceRepository.find({
      relations: ['job'],
      order: {
        start: 'DESC',
      },
      skip: offset,
      take: perPage,
    });

    return {
      jobinstances: data,
      meta: {
        page: page,
        perPage: perPage,
        count: Math.ceil(count / perPage),
      },
      DOCROOT: this.appService.getDocRoot(),
    };
  }

  @Get('details/:id')
  @UseGuards(AuthGuard)
  @Render('jobinstance_details')
  async getDetails(@Req() req: Request) {
    let j = await this.jobinstanceRepository.findOne({
      where: { id: parseInt(req.params['id']) },
    });
    return {
      jobinstance: j,
      DOCROOT: this.appService.getDocRoot(),
    };
  }
}
