#!/bin/bash

DBNAME=$1
BACKUPDIR=$2
RAND=$RANDOM
cat <<- EOF
-- ${DBNAME} | ${BACKUPDIR}
-- PRINT "Start Backup ${DBNAME} process...";
DECLARE @MyFileName$RAND varchar(200)
-- SELECT @MyFileName$RAND=N'${BACKUPDIR}${DBNAME}' + convert(nvarchar(20),GetDate(),112)+'_'+convert(nvarchar(20),GetDate(),108)+ '.bak'
SELECT @MyFileName$RAND=N'${BACKUPDIR}${DBNAME}' + convert(nvarchar(20),GetDate(),112)+ '.bak'
BACKUP DATABASE [${DBNAME}] TO DISK=@MyFileName$RAND
-- PRINT "Finished backup process ${DBNAME} ...";
EOF

