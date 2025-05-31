import { MedioTransferencia } from '@confixcell/modelos';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { MedioTransferenciaOrm } from 'src/infrastructure/entities/MovimientosRecurso/MedioTransferenciaOrm';
import { DestroyOptions, FindOptions, Transaction, UpdateOptions } from 'sequelize';
import { SessionData } from 'src/utils/interfaces';
import { ERROR } from 'src/utils/constants';
import { v4 } from 'uuid';

@Injectable()
export class MedioTransferenciaService {

    constructor(
        @InjectModel(MedioTransferenciaOrm) private medioTransferenciaOrm: typeof MedioTransferenciaOrm,
    )
    {}


    async getCollection( s: SessionData )
    {
        const data = await this.medioTransferenciaOrm.findAll({
            transaction: s.transaction
        });

        return data.map( orm => new MedioTransferencia({ ...orm.get() }) );
    }


    async getObjectByUuid( s: SessionData, item: MedioTransferencia )
    {
        const orm = await this.medioTransferenciaOrm.findOne( {
            transaction: s.transaction,
            where: {
                uuid: item.uuid
            }
        } );

        if ( !orm ) throw new InternalServerErrorException( ERROR.UUID_INVALIDATE );

        return new MedioTransferencia({ ...orm.get() });
    }


    async create( s: SessionData, item: MedioTransferencia )
    {
        item.set({
            uuid: v4()
        });

        await this.medioTransferenciaOrm.create({
            uuid: item.uuid,
            nombre: item.nombre
        }, {
            transaction: s.transaction
        });

        return await this.getObjectByUuid( s, item );
    }


    async update( s: SessionData, item: MedioTransferencia )
    {
        const [af1] = await this.medioTransferenciaOrm.update({
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


    async delete( s: SessionData, item: MedioTransferencia )
    {
        const af1 = await this.medioTransferenciaOrm.destroy({
            transaction: s.transaction,
            where: {
                uuid: item.uuid
            }
        })

        if ( af1 === 0 ) throw new InternalServerErrorException( ERROR.NON_DELETE );
    }
}