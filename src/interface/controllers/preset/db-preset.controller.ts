import { DbPreset } from '@confixcell/modelos';
import { Controller, Get, Post, Put } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { DbPresetService } from 'src/domain/application/preset/db-preset.service';
import { SessionDecorator } from 'src/interface/decorators/session.decorator';
import { SessionData } from 'src/utils/interfaces';

@Controller('dbPreset')
export class DbPresetController {

    constructor(
        private dbPresetService: DbPresetService
    )
    {}

    @Get('getCollection')
    async getCollection(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.dbPresetService.getCollection( sessionData );
    }

    @ApiBody({})
    @Post('getObjectByUuid')
    async getObjectByUuid(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.dbPresetService.getObjectByUuid( sessionData, new DbPreset( sessionData.json ) );
    }

    @ApiBody({})
    @Put('update')
    async update(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.dbPresetService.update( sessionData, new DbPreset( sessionData.json ) );
    }
}
