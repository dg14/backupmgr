## Description

Backupmgr is a tool, written in typescript with [nestjs](https://nestjs.com) for manage scheduling of scripts that permit to launch backups and shell script in order to manage a containerized SQL Server.

Features:
- job definition with cron, type (for now sql launched via sqlcmd, and bash)
- job instance (runs of job), with log
- backups explorer (getting list of files, and foreach file details about internal files (data and log)).
- manage users (2 levels, one admin and one normal user)
- notifications (tested with mailpit, in starttls and authentication).

Lacks:
- is not scalable (it's based on @nestjs/schedule that is based on cron).
- must be tested more.

The db where all is stored is directly in sql server (tested with a sql server 2019 latest containerized, on podman).

Todo:
- exploring db (all databases, sizes, system users and roles of each one, on each db and at system level).
- eventualiy

## Installation

Prepare the .env file (there's a .env.default with default data).

```bash
$ pnpm install
```

## Running the app

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Test

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Support

BackupMgr is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please visit [read more here](https://github.com/dg14/backupmgr).


BackupMgr is [MIT licensed](LICENSE).
