import { Controller, Post } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { SessionDecorator } from 'src/decorators/session.decorator';
import { IntegridadService } from 'src/services/integridad.service';
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