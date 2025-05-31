import { MedioTransferencia } from '@confixcell/modelos';
import { Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { MedioTransferenciaService } from 'src/domain/application/documentos-fuente/medio-transferencia.service';
import { SessionDecorator } from 'src/interface/decorators/session.decorator';
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
    @Post('getObjectByUuid')
    async getObjectByUuid(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.medioTransferenciaService.getObjectByUuid( sessionData, new MedioTransferencia({ ...sessionData.json }) );
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