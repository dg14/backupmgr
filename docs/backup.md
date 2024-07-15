# backup script

For backing up: (`@BACKUPDIR@` is expanded to BACKUP_DIR variable)
```sql
    PRINT "Start Backup process...";
    DECLARE @MyFileName varchar(200)
    SELECT @MyFileName=N'/@BACKUPDIR@/backupdb_' + convert(nvarchar(20),GetDate(),112)+'_'+convert(nvarchar(20),GetDate(),108)+ '.bak'
    BACKUP DATABASE [backupdb] TO DISK=@MyFileName
    PRINT "Finished backup process...";
```