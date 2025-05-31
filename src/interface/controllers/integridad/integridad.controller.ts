import { Controller, Post } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { IntegridadService } from 'src/infrastructure/services/integridad.service';
import { SessionDecorator } from 'src/interface/decorators/session.decorator';
import { SessionData } from 'src/utils/interfaces';

@Controller('integridad')
export class IntegridadController {

    constructor(
        private integridadService: IntegridadService
    )
    {}

    @ApiBody({})
    @Post()
    async verifyInternalUuid(
        @SessionDecorator() sessionData: SessionData
    )
    {
        return await this.integridadService.verifyInternalUuid( Array.isArray( sessionData.json ) ? sessionData.json.map( x => String(x) ) : [] );
    }
}