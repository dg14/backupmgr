import {
  Controller,
  Get,
  Post,
  Render,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request, Response } from 'express';
import { AppService } from 'src/app.service';
import { AuthGuard } from '../services/authguard.service';
import { JobmanagerService } from '../services/jobmanager.service';
import { Job } from 'src/models/job/job';
import { JobService } from 'src/services/job.service';
import { Repository } from 'typeorm';

@Controller('jobs')
export class JobController {
  constructor(
    @InjectRepository(Job) private jobRepository: Repository<Job>,
    private jobService: JobService,
    private jobManagerService: JobmanagerService,
    private appService: AppService,
  ) {}

  @Get('list')
  @UseGuards(AuthGuard)
  @Render('jobs_list')
  async getallJobs(@Req() req: Request) {
    return {
      jobs: await this.jobRepository.find(),
      DOCROOT: this.appService.getDocRoot(),
      level: this.appService.getUserLevel(req),
    };
  }
  @Get('new')
  @UseGuards(AuthGuard)
  @Render('jobs_form')
  async createJob(@Req() req: Request) {
    return {
      level: this.appService.getUserLevel(req),
      jobs: this.jobRepository.find(),
      DOCROOT: this.appService.getDocRoot(),
    };
  }
  @Get('details/:id')
  @UseGuards(AuthGuard)
  @Render('jobs_form')
  async modify_job(@Req() req: Request) {
    let j = await this.jobRepository.findOne({
      where: { id: parseInt(req.params['id']) },
    });
    return {
      job: j,
      level: this.appService.getUserLevel(req),
      DOCROOT: this.appService.getDocRoot(),
      langtype: j.type == 'sql' ? 'sql' : 'bash',
    };
  }
  @Post('save')
  @UseGuards(AuthGuard)
  async saveJob(@Req() req: Request, @Res() res: Response) {
    let j = await this.jobService.save(req.body);
    res.redirect(302, `${this.appService.getDocRoot()}/jobs/details/${j.id}`);
  }
  @Get('restart')
  @UseGuards(AuthGuard)
  async restart() {
    await this.jobManagerService.stopAll();
    await this.jobManagerService.startAll();
    return {
      success: true,
    };
  }
  @Get('check/:id')
  @UseGuards(AuthGuard)
  async checkCron(@Req() req: Request) {
    return this.jobManagerService.check(req.params['id']);
  }
}
