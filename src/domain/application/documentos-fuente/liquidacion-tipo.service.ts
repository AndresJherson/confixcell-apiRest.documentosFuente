import { LiquidacionTipo } from '@confixcell/modelos';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DestroyOptions, FindOptions, Transaction, UpdateOptions } from 'sequelize';
import { LiquidacionTipoOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentosTransaccion/LiquidactionTipoOrm';
import { ERROR } from 'src/utils/constants';
import { SessionData } from 'src/utils/interfaces';
import { v4 } from 'uuid';

@Injectable()
export class LiquidacionTipoService {

    constructor(
        @InjectModel(LiquidacionTipoOrm) private liquidacionTipoOrm: typeof LiquidacionTipoOrm,
    )
    {}


    async getCollection( s: SessionData )
    {
        const data = await this.liquidacionTipoOrm.findAll({
            transaction: s.transaction
        });

        return data.map( orm => new LiquidacionTipo({ ...orm.get() }) );
    }


    async getObjectByUuid( s: SessionData, item: LiquidacionTipo )
    {
        const orm = await this.liquidacionTipoOrm.findOne( {
            transaction: s.transaction,
            where: {
                uuid: item.uuid
            }
        } );

        if ( !orm ) throw new InternalServerErrorException( ERROR.UUID_INVALIDATE );

        return new LiquidacionTipo({ ...orm.get() });
    }


    async create( s: SessionData, item: LiquidacionTipo )
    {
        item.set({
            uuid: v4()
        });

        await this.liquidacionTipoOrm.create({
            uuid: item.uuid,
            nombre: item.nombre
        }, {
            transaction: s.transaction
        });

        return await this.getObjectByUuid( s, item );
    }


    async update( s: SessionData, item: LiquidacionTipo )
    {
        const [af1] = await this.liquidacionTipoOrm.update({
            nombre: item.nombre
        }, {
            transaction: s.transaction,
            where: {
                uuid: item.uuid
            }
        });

        if ( af1 === 0 ) throw new InternalServerErrorException( ERROR.NON_UPDATE );

        return await this.getObjectByUuid( s, item );
    }


    async delete( s: SessionData, item: LiquidacionTipo )
    {
        const af1 = await this.liquidacionTipoOrm.destroy({
            transaction: s.transaction,
            where: {
                uuid: item.uuid
            }
        })

        if ( af1 === 0 ) throw new InternalServerErrorException( ERROR.NON_DELETE );
    }
}