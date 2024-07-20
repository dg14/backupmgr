import { Controller, Get, Render, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AppService } from 'src/app.service';
import { AuthGuard } from 'src/services/authguard.service';
import { EntityManager, Repository } from 'typeorm';

@Controller('secexp')
export class SecurityExplorerController {
	constructor(
		private entityManager: EntityManager,
		private readonly appService: AppService,
	) { }

	@Get()
	@UseGuards(AuthGuard)
	@Render('secexp_list')
	async getDbs(@Req() req: Request) {
		let dbs = await this.entityManager.query(
			`      SELECT 
		database_name = DB_NAME(database_id)
  FROM sys.databases WITH(NOWAIT)`
		);
		return {
			dbs: dbs,
			level: this.appService.getUserLevel(req),
			DOCROOT: this.appService.getDocRoot(),
		};
	}


	@Get('details/:name')
	@UseGuards(AuthGuard)
	@Render('secexp_details')
	async index(@Req() req: Request) {
		let db = req.params["name"];
		// https://gist.github.com/jzabroski/ec7731e3bdd0ee219108457de328797c
		let query = `use ${db}; DECLARE @HideDatabaseDiagrams BIT = 1;

--List all access provisioned to a sql user or windows user/group directly 
SELECT  
    [UserName] = CASE princ.[type] 
                    WHEN 'S' THEN princ.[name]
                    WHEN 'U' THEN ulogin.[name] COLLATE Latin1_General_CI_AI
					WHEN 'R' THEN NULL -- Database Role
					WHEN 'G' THEN NULL -- Windows Group
					ELSE NULL
                 END,
    [UserType] = CASE princ.[type]
                    WHEN 'S' THEN 'SQL User'
                    WHEN 'U' THEN 'Windows User'
					WHEN 'R' THEN NULL -- Database Role
					WHEN 'G' THEN NULL -- Windows Group
					ELSE princ.[type]
                 END,
	[PrincipalUserName] = COALESCE(
					CASE princ.[type] 
						WHEN 'S' THEN princ.[name]
						WHEN 'U' THEN ulogin.[name] COLLATE Latin1_General_CI_AI
						WHEN 'R' THEN NULL -- Database Role
						WHEN 'G' THEN NULL -- Windows Group
						ELSE NULL
					 END,
					 princ.[name]
				 ),
	[PrincipalType] = CASE princ.[type]
                    WHEN 'S' THEN 'SQL User'
                    WHEN 'U' THEN 'Windows User'
					WHEN 'R' THEN 'Database Role'
					WHEN 'G' THEN 'Windows Group'
                 END, 
    [DatabaseUserName] = princ.[name],       
    [Role] = null,      
    [PermissionType] = perm.[permission_name],       
    [PermissionState] = perm.[state_desc],       
    [ObjectType] = obj.type_desc,--perm.[class_desc],       
    [ObjectName] = OBJECT_NAME(perm.major_id),
    [ColumnName] = col.[name]
FROM    
    --database user
    sys.database_principals princ  
LEFT JOIN
    --Login accounts
    sys.login_token ulogin on princ.[sid] = ulogin.[sid]
LEFT JOIN        
    --Permissions
    sys.database_permissions perm ON perm.[grantee_principal_id] = princ.[principal_id]
LEFT JOIN
    --Table columns
    sys.columns col ON col.[object_id] = perm.major_id 
                    AND col.[column_id] = perm.[minor_id]
LEFT JOIN
    sys.objects obj ON perm.[major_id] = obj.[object_id]
WHERE 
    princ.[type] in ('S','U')
	AND CASE
		WHEN @HideDatabaseDiagrams = 1 AND
		princ.[name] = 'guest'
		AND (
			(
				obj.type_desc = 'SQL_SCALAR_FUNCTION'
				AND OBJECT_NAME(perm.major_id) = 'fn_diagramobjects'
			)
			OR (
				obj.type_desc = 'SQL_STORED_PROCEDURE'
				AND OBJECT_NAME(perm.major_id) IN
				(
					N'sp_alterdiagram',
					N'sp_creatediagram',
					N'sp_dropdiagram',
					N'sp_helpdiagramdefinition',
					N'sp_helpdiagrams',
					N'sp_renamediagram'
				)
			)
		)
		THEN 0
		ELSE 1
	END = 1
UNION
--List all access provisioned to a sql user or windows user/group through a database or application role
SELECT  
    [UserName] = CASE memberprinc.[type] 
                    WHEN 'S' THEN memberprinc.[name]
                    WHEN 'U' THEN ulogin.[name] COLLATE Latin1_General_CI_AI
					WHEN 'R' THEN NULL -- Database Role
					WHEN 'G' THEN NULL -- Windows Group
					ELSE NULL
                 END,
    [UserType] = CASE memberprinc.[type]
                    WHEN 'S' THEN 'SQL User'
                    WHEN 'U' THEN 'Windows User'
					WHEN 'R' THEN NULL -- Database Role
					WHEN 'G' THEN NULL -- Windows Group
                 END, 
	[PrincipalUserName] = COALESCE(
					CASE memberprinc.[type] 
						WHEN 'S' THEN memberprinc.[name]
						WHEN 'U' THEN ulogin.[name] COLLATE Latin1_General_CI_AI
						WHEN 'R' THEN NULL -- Database Role
						WHEN 'G' THEN NULL -- Windows Group
						ELSE NULL
					 END,
					 memberprinc.[name]
				 ),
	[PrincipalType] = CASE memberprinc.[type]
                    WHEN 'S' THEN 'SQL User'
                    WHEN 'U' THEN 'Windows User'
					WHEN 'R' THEN 'Database Role'
					WHEN 'G' THEN 'Windows Group'
                 END, 
    [DatabaseUserName] = memberprinc.[name],   
    [Role] = roleprinc.[name],      
    [PermissionType] = perm.[permission_name],       
    [PermissionState] = perm.[state_desc],       
    [ObjectType] = obj.type_desc,--perm.[class_desc],   
    [ObjectName] = OBJECT_NAME(perm.major_id),
    [ColumnName] = col.[name]
FROM    
    --Role/member associations
    sys.database_role_members members
JOIN
    --Roles
    sys.database_principals roleprinc ON roleprinc.[principal_id] = members.[role_principal_id]
JOIN
    --Role members (database users)
    sys.database_principals memberprinc ON memberprinc.[principal_id] = members.[member_principal_id]
LEFT JOIN
    --Login accounts
    sys.login_token ulogin on memberprinc.[sid] = ulogin.[sid]
LEFT JOIN        
    --Permissions
    sys.database_permissions perm ON perm.[grantee_principal_id] = roleprinc.[principal_id]
LEFT JOIN
    --Table columns
    sys.columns col on col.[object_id] = perm.major_id 
                    AND col.[column_id] = perm.[minor_id]
LEFT JOIN
    sys.objects obj ON perm.[major_id] = obj.[object_id]
WHERE    
	CASE
		WHEN @HideDatabaseDiagrams = 1 AND
		memberprinc.[name] = 'guest'
		AND (
			(
				obj.type_desc = 'SQL_SCALAR_FUNCTION'
				AND OBJECT_NAME(perm.major_id) = 'fn_diagramobjects'
			)
			OR (
				obj.type_desc = 'SQL_STORED_PROCEDURE'
				AND OBJECT_NAME(perm.major_id) IN
				(
					N'sp_alterdiagram',
					N'sp_creatediagram',
					N'sp_dropdiagram',
					N'sp_helpdiagramdefinition',
					N'sp_helpdiagrams',
					N'sp_renamediagram'
				)
			)
		)
		THEN 0
		ELSE 1
	END = 1
UNION
--List all access provisioned to the public role, which everyone gets by default
SELECT  
    [UserName] = '{All Users}',
    [UserType] = '{All Users}',
	[PrincipalUserName] = '{All Users}',
	[PrincipalType] = '{All Users}',
    [DatabaseUserName] = '{All Users}',       
    [Role] = roleprinc.[name],      
    [PermissionType] = perm.[permission_name],       
    [PermissionState] = perm.[state_desc],       
    [ObjectType] = obj.type_desc,--perm.[class_desc],  
    [ObjectName] = OBJECT_NAME(perm.major_id),
    [ColumnName] = col.[name]
FROM    
    --Roles
    sys.database_principals roleprinc
LEFT JOIN        
    --Role permissions
    sys.database_permissions perm ON perm.[grantee_principal_id] = roleprinc.[principal_id]
LEFT JOIN
    --Table columns
    sys.columns col on col.[object_id] = perm.major_id 
                    AND col.[column_id] = perm.[minor_id]                   
JOIN 
    --All objects   
    sys.objects obj ON obj.[object_id] = perm.[major_id]
WHERE
    --Only roles
    roleprinc.[type] = 'R' AND
    --Only public role
    roleprinc.[name] = 'public' AND
    --Only objects of ours, not the MS objects
    obj.is_ms_shipped = 0
	AND CASE
		WHEN @HideDatabaseDiagrams = 1 AND
		roleprinc.[name] = 'public'
		AND (
			(
				obj.type_desc = 'SQL_SCALAR_FUNCTION'
				AND OBJECT_NAME(perm.major_id) = 'fn_diagramobjects'
			)
			OR (
				obj.type_desc = 'SQL_STORED_PROCEDURE'
				AND OBJECT_NAME(perm.major_id) IN
				(
					N'sp_alterdiagram',
					N'sp_creatediagram',
					N'sp_dropdiagram',
					N'sp_helpdiagramdefinition',
					N'sp_helpdiagrams',
					N'sp_renamediagram'
				)
			)
		)
		THEN 0
		ELSE 1
	END = 1
ORDER BY
    princ.[Name],
    OBJECT_NAME(perm.major_id),
    col.[name],
    perm.[permission_name],
    perm.[state_desc],
    obj.type_desc--perm.[class_desc]`;

		return {
			db: db,
			items: this.entityManager.query(query),
			level: this.appService.getUserLevel(req),
			DOCROOT: this.appService.getDocRoot(),
		};
	}
}
