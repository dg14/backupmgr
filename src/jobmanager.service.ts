import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from './models/job/job';
import { Repository } from 'typeorm';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { Jobinstance } from './models/jobinstance/jobinstance';
import { JSQLHelper } from './models/helpers/jsqlhelper';

@Injectable()
export class JobmanagerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(JobmanagerService.name);

  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @InjectRepository(Jobinstance)
    private readonly jobinstanceRepository: Repository<Jobinstance>,
    private readonly jsqlHelper: JSQLHelper,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  onModuleDestroy() {
    this.logger.log('STOPPING UP');
  }

  async onModuleInit() {
    await this.startAll();
    this.logger.log('STARTING UP');
  }
  async stopAll() {
    this.schedulerRegistry.getCronJobs().forEach((value, key, map) => {
      value.stop();
      this.schedulerRegistry.deleteCronJob(key);
    });
  }

  async startAll() {
    const jobs = await this.jobRepository.find();
    jobs.forEach((job) => {
      if (job.active) {
        this.logger.log('Starting:' + job.name + ' at ' + job.cron);
        let j = new CronJob(job.cron, () => this.processJob(job));
        this.schedulerRegistry.addCronJob(job.id.toString(), j);
        j.start();
      }
    });
  }
  async processJob(job: Job) {
    const jobinstance = new Jobinstance();
    jobinstance.job = job;
    jobinstance.status = 'running';
    jobinstance.start = new Date();
    let insta = await this.jobinstanceRepository.save(jobinstance);
    try {
      let out = this.jsqlHelper.run(job);

      insta.exit = 0;
      insta.end = new Date();
      insta.status = 'success';
      insta.log = out;
      await this.jobinstanceRepository.save(insta);
    } catch (e) {
      this.logger.error(e.message, e.stack);
      insta.exit = 1;
      insta.end = new Date();
      insta.status = 'error';
      await this.jobinstanceRepository.save(insta);
    }
    job.lastRun = new Date();
    this.jobRepository.save(job);
  }

  launchJob(job: Job) {
    let j = new CronJob(new Date(), () => this.processJob(job));
    j.start();
  }

  check(arg0: any) {
    return true;
  }
}
