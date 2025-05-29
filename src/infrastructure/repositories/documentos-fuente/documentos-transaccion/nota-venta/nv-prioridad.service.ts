import { NotaVentaPrioridad } from '@confixcell/modelos';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { NvPrioridadOrm } from 'src/infrastructure/entities/DocumentosFuente/DocumentosTransaccion/NotaVenta/NvPrioridadOrm';
import { ConectorService } from 'src/infrastructure/services/conector.service';
import { ERROR } from 'src/utils/constants';
import { SessionData } from 'src/utils/interfaces';

@Injectable()
export class NvPrioridadRepository {

    constructor(
        @InjectModel(NvPrioridadOrm) private nvPrioridadOrm: typeof NvPrioridadOrm,
        private conectorService: ConectorService
    )
    {}


    async getId( s: SessionData )
    {
        return await this.conectorService.getId( s.transaction, 'nv_prioridad' );
    }


    async getCollection( s: SessionData )
    {
        const data = await this.nvPrioridadOrm.findAll({
            transaction: s.transaction
        });

        return data.map( entity => new NotaVentaPrioridad({ ...entity.get() }) );
    }


    async getObjectById( s: SessionData, nvPrioridad: NotaVentaPrioridad )
    {
        const entity = await this.nvPrioridadOrm.findByPk( nvPrioridad.id, {
            transaction: s.transaction
        } );

        if ( !entity ) throw new InternalServerErrorException( ERROR.ID_INVALIDATE );

        return new NotaVentaPrioridad({ ...entity.get() });
    }


    async create( s: SessionData, nvPrioridad: NotaVentaPrioridad )
    {
        nvPrioridad.set({
            id: await this.getId( s )
        });

        await this.nvPrioridadOrm.create({
            id: nvPrioridad.id,
            nombre: nvPrioridad.nombre
        }, {
            transaction: s.transaction
        });

        return await this.getObjectById( s, nvPrioridad );
    }


    async update( s: SessionData, nvPrioridad: NotaVentaPrioridad )
    {
        const [af1] = await this.nvPrioridadOrm.update({
            nombre: nvPrioridad.nombre
        }, {
            transaction: s.transaction,
            where: {
                id: nvPrioridad.id
            }
        });

        if ( af1 === 0 ) throw new InternalServerErrorException( ERROR.NON_UPDATE );

        return await this.getObjectById( s, nvPrioridad );
    }


    async delete( s: SessionData, nvPrioridad: NotaVentaPrioridad )
    {
        const af1 = await this.nvPrioridadOrm.destroy({
            transaction: s.transaction,
            where: {
                id: nvPrioridad.id
            }
        })

        if ( af1 === 0 ) throw new InternalServerErrorException( ERROR.NON_DELETE );
    }
}