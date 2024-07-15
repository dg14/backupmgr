import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from '../models/job/job';
import { Repository } from 'typeorm';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { Jobinstance } from '../models/jobinstance/jobinstance';
import { JSQLHelper } from '../models/helpers/jsqlhelper';
import { EmailService } from './email.service';
import { User } from 'src/models/user/user';

@Injectable()
export class JobmanagerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(JobmanagerService.name);

  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @InjectRepository(Jobinstance)
    private readonly jobinstanceRepository: Repository<Jobinstance>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private emailService: EmailService,
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
        let j = new CronJob(job.cron, async () => {
          this.logger.log('Start--');
          try {
            await this.processJob(job);
          } catch (e) {
            this.logger.error(e.message, e.stack);
          }
        });
        this.schedulerRegistry.addCronJob(job.id.toString(), j);
        j.start();
      }
    });
    let sizeMonitor = new CronJob('0 0 23 * * *', async () => {
      await this.jsqlHelper.fetchSizes();
    });
    this.schedulerRegistry.addCronJob(
      'size_mon',
      sizeMonitor,
    );
    sizeMonitor.start();
  }
  async processJob(job: Job) {
    this.logger.log('Starting job:' + job.name);
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
    await this.notifyUsers(insta);
    let j1 = await this.jobRepository.findOneBy({ id: job.id });
    j1.lastRun = new Date();
    this.jobRepository.save(j1);
    this.logger.log('job:' + job.name + ' done');
  }
  async notifyUsers(insta: Jobinstance) {
    this.logger.log('Notifying users for job:' + insta.job.name + ' done');
    let list = await this.userRepository.find();
    for (let user of list) {
      this.logger.log('TO:' + user.email);
      this.emailService.sendJobNotification(user, insta);
    }
  }

  launchJob(job: Job) {
    let j = new CronJob(new Date(), () => this.processJob(job));
    j.start();
  }

  check(arg0: any) {
    return true;
  }
}
