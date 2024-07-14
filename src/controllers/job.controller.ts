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
import { AuthGuard } from 'src/authguard.service';
import { JobmanagerService } from 'src/jobmanager.service';
import { Job } from 'src/models/job/job';
import { JobService } from 'src/services/job.service';
import { Repository } from 'typeorm';

@Controller('jobs')
export class JobController {
  constructor(
    @InjectRepository(Job) private jobRepository: Repository<Job>,
    private jobService: JobService,
    private jobManagerService: JobmanagerService,
  ) {}

  @Get('list')
  @UseGuards(AuthGuard)
  @Render('jobs_list')
  async getallJobs() {
    return {
      jobs: await this.jobRepository.find(),
      DOCROOT: process.env.SUFFIX_URL,
    };
  }
  @Get('new')
  @UseGuards(AuthGuard)
  @Render('jobs_form')
  async createJob() {
    return {
      jobs: this.jobRepository.find(),
      DOCROOT: process.env.SUFFIX_URL,
    };
  }
  @Get('details/:id')
  @UseGuards(AuthGuard)
  @Render('jobs_form')
  async modify_job(@Req() req) {
    let j = await this.jobRepository.findOne({
      where: { id: parseInt(req.params['id']) },
    });
    return {
      job: j,
      DOCROOT: process.env.SUFFIX_URL,
      langtype: (j.type=='sql'?'sql':'bash')
    };
  }
  @Post('save')
  @UseGuards(AuthGuard)
  async saveJob(@Req() req, @Res() res) {
    let j = await this.jobService.save(req.body);
    res.redirect(302, '/jobs/details/' + j.id);
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
  async checkCron(@Req() req) {
    return this.jobManagerService.check(req.params['id']);
  }
}
