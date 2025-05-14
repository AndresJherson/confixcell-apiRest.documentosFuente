import { LiquidacionTipo } from '@confixcell/modelos';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { LiquidacionTipoEntity } from 'src/entities/DocumentosFuente/DocumentosTransaccion/LiquidactionTipoEntity';
import { ERROR } from 'src/utils/constants';
import { SessionData } from 'src/utils/interfaces';

@Injectable()
export class LiquidacionTipoService {

    constructor(
        @InjectModel(LiquidacionTipoEntity) private liquidacionTipoEntity: typeof LiquidacionTipoEntity
    )
    {}


    async getCollection( s: SessionData )
    {
        return await this.liquidacionTipoEntity.findAll({
            transaction: s.transaction
        }).then( data => data.map( entity => new LiquidacionTipo({ ...entity.get() }) ) );
    }


    async getObjectById( s: SessionData, liquidacionTipo: LiquidacionTipo )
    {
        const entity = await this.liquidacionTipoEntity.findByPk( liquidacionTipo.id, {
            transaction: s.transaction
        } );

        if ( !entity ) throw new InternalServerErrorException( ERROR.ID_INVALIDATE );

        return new LiquidacionTipo({ ...entity.get() });
    }
}