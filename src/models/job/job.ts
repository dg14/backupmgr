import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Job {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  cron: string;

  @Column({ type: 'text' })
  script: string;

  @Column({ default: true })
  active: boolean;
  @Column({ nullable: true })
  lastRun: Date;
  @Column({ nullable: true })
  lastExit: number;
  @Column({ nullable: true })
  status: string;

  @Column({ default: 'sql' })
  type: string;
}
