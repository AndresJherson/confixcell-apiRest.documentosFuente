import { MedioTransferencia } from '@confixcell/modelos';
import { Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { SessionDecorator } from 'src/decorators/session.decorator';
import { MedioTransferenciaService } from 'src/repositories/documentos-fuente/medio-transferencia.service';
import { SessionData } from 'src/utils/interfaces';

@Controller('medioTransferencia')
export class MedioTransferenciaController {

    constructor(
        private medioTransferenciaService: MedioTransferenciaService
    )
    {}


    @Get('getCollection')
    async getCollection(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.medioTransferenciaService.getCollection( sessionData );
    }


    @ApiBody({})
    @Post('getObjectById')
    async getObjectById(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.medioTransferenciaService.getObjectById( sessionData, new MedioTransferencia({ ...sessionData.json }) );
    }


    @ApiBody({})
    @Post('create')
    async create(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.medioTransferenciaService.create( sessionData, new MedioTransferencia({ ...sessionData.json }) );
    }


    @ApiBody({})
    @Put('update')
    async update(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.medioTransferenciaService.update( sessionData, new MedioTransferencia({ ...sessionData.json }) );
    }


    @ApiBody({})
    @Delete('delete')
    async delete(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.medioTransferenciaService.delete( sessionData, new MedioTransferencia({ ...sessionData.json }) );
    }
}