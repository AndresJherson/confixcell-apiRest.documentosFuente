import { NotaVentaCategoriaReparacion } from '@confixcell/modelos';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { NvCategoriaReparacionOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentosTransaccion/NotaVenta/SalidaProduccionServicioReparacion/NvCategoriaReparacionOrm';
import { ConectorService } from 'src/infrastructure/services/conector.service';
import { ERROR } from 'src/utils/constants';
import { SessionData } from 'src/utils/interfaces';

@Injectable()
export class NvCategoriaReparacionRepository {

    constructor(
        @InjectModel(NvCategoriaReparacionOrm) private nvCategoriaReparacionOrm: typeof NvCategoriaReparacionOrm,
        private conectorService: ConectorService
    )
    {}


    async getId( s: SessionData )
    {
        return await this.conectorService.getId( s.transaction, 'nv_categoria_reparacion' );
    }


    async getCollection( s: SessionData )
    {
        const data = await this.nvCategoriaReparacionOrm.findAll({
            transaction: s.transaction
        });

        return data.map( entity => new NotaVentaCategoriaReparacion({ ...entity.get() }) );
    }


    async getObjectById( s: SessionData, nvCategoriaReparacion: NotaVentaCategoriaReparacion )
    {
        const entity = await this.nvCategoriaReparacionOrm.findByPk( nvCategoriaReparacion.id, {
            transaction: s.transaction
        } );

        if ( !entity ) throw new InternalServerErrorException( ERROR.ID_INVALIDATE );

        return new NotaVentaCategoriaReparacion({ ...entity.get() });
    }


    async create( s: SessionData, nvCategoriaReparacion: NotaVentaCategoriaReparacion )
    {
        nvCategoriaReparacion.set({
            id: await this.getId( s )
        });

        await this.nvCategoriaReparacionOrm.create({
            id: nvCategoriaReparacion.id,
            nombre: nvCategoriaReparacion.nombre
        }, {
            transaction: s.transaction
        });

        return await this.getObjectById( s, nvCategoriaReparacion );
    }


    async update( s: SessionData, nvCategoriaReparacion: NotaVentaCategoriaReparacion )
    {
        const [af1] = await this.nvCategoriaReparacionOrm.update({
            nombre: nvCategoriaReparacion.nombre
        }, {
            transaction: s.transaction,
            where: {
                id: nvCategoriaReparacion.id
            }
        });

        if ( af1 === 0 ) throw new InternalServerErrorException( ERROR.NON_UPDATE );

        return await this.getObjectById( s, nvCategoriaReparacion );
    }


    async delete( s: SessionData, nvCategoriaReparacion: NotaVentaCategoriaReparacion )
    {
        const af1 = await this.nvCategoriaReparacionOrm.destroy({
            transaction: s.transaction,
            where: {
                id: nvCategoriaReparacion.id
            }
        })

        if ( af1 === 0 ) throw new InternalServerErrorException( ERROR.NON_DELETE );
    }
}