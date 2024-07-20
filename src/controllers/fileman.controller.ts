import { Body, Controller, Get, Post, Render, Req, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { AppService } from "src/app.service";
import { FileDto } from "src/models/file.dto";
import { AuthService } from "src/services/auth.service";
import { AuthGuard } from "src/services/authguard.service";
import { FileService } from "src/services/file.service";
import { Request, Response } from 'express';

@Controller('fileman')
export class FilemanController {
    constructor(
        private readonly appService: AppService,
        private readonly authService: AuthService,
        private readonly fileService: FileService
    ) {

    }
    @Get('')
    @Render('fs_list')
    @UseGuards(AuthGuard)
    async listFiles(@Req() req: Request) {
        return {
            files: this.fileService.getFiles(),
            DOCROOT: this.appService.getDocRoot(),
            level: this.appService.getUserLevel(req),
        };
    }
    @Get('files')
    @Render('fs_upload')
    @UseGuards(AuthGuard)
    uploadFileForm(@Req() req: Request) {
        return {
            DOCROOT: this.appService.getDocRoot(),
            level: this.appService.getUserLevel(req),
        };
    }


    @UseInterceptors(FileInterceptor('file'))
    @Post('files')
    @UseGuards(AuthGuard)
    uploadFile(
        @Body() body: FileDto,
        @UploadedFile() file: Express.Multer.File,
        @Req() req: Request,
        @Res() res: Response

    ) {
        this.fileService.pushFile(file);
        res.redirect(`${this.appService.getDocRoot()}/fileman`);
    }

    @Get('delete/:id')
    @UseGuards(AuthGuard)
    rmFile(@Req() req: Request, @Res() res: Response) {
        this.fileService.removeFile(req.params.id);
        res.redirect(`${this.appService.getDocRoot()}/fileman`);
    }
    @Get('moverestore/:id')
    @UseGuards(AuthGuard)
    moveRestore(@Req() req: Request, @Res() res: Response) {
        this.fileService.moveToRestore(req.params.id);
        res.redirect(`${this.appService.getDocRoot()}/fileman`);
    }

}

