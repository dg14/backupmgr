import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  login: string;

  @Column()
  password: string;
  @Column()
  level: number;
  @Column({ default: true })
  active: boolean;
  @Column()
  createdAt: Date;
  @Column()
  updatedAt: Date;
  @Column({ default: false })
  notifications: boolean;

  @Column({ default: '' })
  email: string;
}
