import { Column, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';

/*
insert into monitoring.dbo.size_mon
SELECT 
	CAST( GETDATE() AS Date ) as date,
      database_name = DB_NAME(database_id)
    , log_size_mb = CAST(SUM(CASE WHEN type_desc = 'LOG' THEN size END) * 8. / 1024 AS DECIMAL(8,2))
    , row_size_mb = CAST(SUM(CASE WHEN type_desc = 'ROWS' THEN size END) * 8. / 1024 AS DECIMAL(8,2))
    , total_size_mb = CAST(SUM(size) * 8. / 1024 AS DECIMAL(8,2))
FROM sys.master_files WITH(NOWAIT)
GROUP BY database_id
 
create table dbo.size_mon (
	date date,
	database_name varchar(50),
	log_size_mb decimal(8,2),
	row_size_mb decimal(8,2),
	total_size_mb decimal(8,2),
	primary key (date,database_name)
)
    */
@Entity()
@Unique(['date', 'database_name'])
@Index(['date', 'database_name'])
export class Sizemon {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  date: Date;
  @Column()
  database_name: string;

  @Column()
  log_size_mb: number;

  @Column()
  row_size_mb: number;

  @Column()
  total_size_mb: number;
}
