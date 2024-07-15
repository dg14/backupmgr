import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'src/models/job/job';
import { Repository } from 'typeorm';

@Injectable()
export class JobService {
  constructor(@InjectRepository(Job) private jobRepository: Repository<Job>) {}
  async save(body: any): Promise<Job> {
    if (!body.id) {
      let j = new Job();
      j.active = body.active && body.active == 'on';
      j.name = body.name;
      j.cron = body.cron;
      j.script = body.script;
      j.type = body.type;
      let j1 = await this.jobRepository.save(j);
      return j1;
    } else {
      let j = await this.jobRepository.findOneBy({ id: body.id });
      if (j) {
        j.active = body.active && body.active == 'on';
        j.cron = body.cron;
        j.name = body.name;
        j.script = body.script;
        j.type = body.type;
        let j1 = await this.jobRepository.save(j);
        return j1;
      }
    }
  }
}
