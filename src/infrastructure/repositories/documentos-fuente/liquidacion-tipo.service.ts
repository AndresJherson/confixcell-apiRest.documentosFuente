import { LiquidacionTipo } from '@confixcell/modelos';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { LiquidacionTipoOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentosTransaccion/LiquidactionTipoOrm';
import { ERROR } from 'src/utils/constants';
import { SessionData } from 'src/utils/interfaces';

@Injectable()
export class LiquidacionTipoRepository {

    constructor(
        @InjectModel(LiquidacionTipoOrm) private liquidacionTipoOrm: typeof LiquidacionTipoOrm
    )
    {}


    async getCollection( s: SessionData )
    {
        return await this.liquidacionTipoOrm.findAll({
            transaction: s.transaction
        }).then( data => data.map( entity => new LiquidacionTipo({ ...entity.get() }) ) );
    }


    async getObjectById( s: SessionData, liquidacionTipo: LiquidacionTipo )
    {
        const entity = await this.liquidacionTipoOrm.findByPk( liquidacionTipo.id, {
            transaction: s.transaction
        } );

        if ( !entity ) throw new InternalServerErrorException( ERROR.ID_INVALIDATE );

        return new LiquidacionTipo({ ...entity.get() });
    }
}