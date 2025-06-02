import { NotaVentaCategoriaReparacion } from '@confixcell/modelos';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { NvCategoriaReparacionOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentosTransaccion/NotaVenta/SalidaProduccionServicioReparacion/NvCategoriaReparacionOrm';
import { ConectorService } from 'src/infrastructure/services/conector.service';
import { ERROR } from 'src/utils/constants';
import { SessionData } from 'src/utils/interfaces';
import { v4 } from 'uuid';

@Injectable()
export class NvCategoriaReparacionService {

    constructor(
        @InjectModel(NvCategoriaReparacionOrm) private nvCategoriaReparacionOrm: typeof NvCategoriaReparacionOrm,
    )
    {}


    async getCollection( s: SessionData )
    {
        const data = await this.nvCategoriaReparacionOrm.findAll({
            transaction: s.transaction
        });

        return data.map( orm => new NotaVentaCategoriaReparacion({ ...orm.get() }) );
    }


    async getObjectByUuid( s: SessionData, item: NotaVentaCategoriaReparacion )
    {
        const orm = await this.nvCategoriaReparacionOrm.findOne( {
            transaction: s.transaction,
            where: {
                uuid: item.uuid
            }
        } );

        if ( !orm ) throw new InternalServerErrorException( ERROR.UUID_INVALIDATE );

        return new NotaVentaCategoriaReparacion({ ...orm.get() });
    }


    async create( s: SessionData, item: NotaVentaCategoriaReparacion )
    {
        item.set({
            uuid: v4()
        });

        await this.nvCategoriaReparacionOrm.create({
            uuid: item.uuid,
            nombre: item.nombre
        }, {
            transaction: s.transaction
        });

        return await this.getObjectByUuid( s, item );
    }


    async update( s: SessionData, item: NotaVentaCategoriaReparacion )
    {
        const [af1] = await this.nvCategoriaReparacionOrm.update({
            nombre: item.nombre ?? null as any
        }, {
            transaction: s.transaction,
            where: {
                uuid: item.uuid
            }
        });

        if ( af1 === 0 ) throw new InternalServerErrorException( ERROR.NON_UPDATE );

        return await this.getObjectByUuid( s, item );
    }


    async delete( s: SessionData, item: NotaVentaCategoriaReparacion )
    {
        const af1 = await this.nvCategoriaReparacionOrm.destroy({
            transaction: s.transaction,
            where: {
                uuid: item.uuid
            }
        })

        if ( af1 === 0 ) throw new InternalServerErrorException( ERROR.NON_DELETE );
    }
}