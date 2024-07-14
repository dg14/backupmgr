import { Job } from 'src/models/job/job';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity()
export class Jobinstance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: true })
  status: string;
  @Column()
  start: Date;

  @Column({ nullable: true })
  end: Date;
  @Column({ nullable: true })
  exit: number;

  @ManyToOne((type) => Job, (job) => job.id)
  job: Job;

  @Column({ type: 'text', nullable: true })
  log: string;
}
