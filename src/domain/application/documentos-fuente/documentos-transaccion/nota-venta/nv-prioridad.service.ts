import { NotaVentaPrioridad } from '@confixcell/modelos';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { NvPrioridadOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentosTransaccion/NotaVenta/NvPrioridadOrm';
import { ERROR } from 'src/utils/constants';
import { SessionData } from 'src/utils/interfaces';
import { v4 } from 'uuid';

@Injectable()
export class NvPrioridadService {

    constructor(
        @InjectModel(NvPrioridadOrm) private nvPrioridadOrm: typeof NvPrioridadOrm,
    )
    {}


    async getCollection( s: SessionData )
    {
        const data = await this.nvPrioridadOrm.findAll({
            transaction: s.transaction
        });

        return data.map( orm => new NotaVentaPrioridad({ ...orm.get() }) );
    }


    async getObjectByUuid( s: SessionData, item: NotaVentaPrioridad )
    {
        const orm = await this.nvPrioridadOrm.findOne( {
            transaction: s.transaction,
            where: {
                uuid: item.uuid
            }
        } );

        if ( !orm ) throw new InternalServerErrorException( ERROR.UUID_INVALIDATE );

        return new NotaVentaPrioridad({ ...orm.get() });
    }


    async create( s: SessionData, item: NotaVentaPrioridad )
    {
        item.set({
            uuid: v4()
        });

        await this.nvPrioridadOrm.create({
            uuid: item.uuid,
            nombre: item.nombre
        }, {
            transaction: s.transaction
        });

        return await this.getObjectByUuid( s, item );
    }


    async update( s: SessionData, item: NotaVentaPrioridad )
    {
        const [af1] = await this.nvPrioridadOrm.update({
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


    async delete( s: SessionData, item: NotaVentaPrioridad )
    {
        const af1 = await this.nvPrioridadOrm.destroy({
            transaction: s.transaction,
            where: {
                uuid: item.uuid
            }
        })

        if ( af1 === 0 ) throw new InternalServerErrorException( ERROR.NON_DELETE );
    }
}