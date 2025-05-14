import { ComprobanteTipo } from '@confixcell/modelos';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ComprobanteTipoEntity } from 'src/entities/DocumentosFuente/DocumentosTransaccion/NotaTransaccionEntrada/ComprobanteTipoEntity';
import { ConectorService } from 'src/services/conector.service';
import { ERROR } from 'src/utils/constants';
import { SessionData } from 'src/utils/interfaces';

@Injectable()
export class ComprobanteTipoService {

    constructor(
        @InjectModel(ComprobanteTipoEntity) private comprobanteTipoEntity: typeof ComprobanteTipoEntity,
        private conectorService: ConectorService
    )
    {}


    async getId( s: SessionData )
    {
        return await this.conectorService.getId( s.transaction, 'comprobante_tipo' );
    }


    async getCollection( s: SessionData )
    {
        const data = await this.comprobanteTipoEntity.findAll({
            transaction: s.transaction
        });

        return data.map( entity => new ComprobanteTipo({ ...entity.get() }) );
    }


    async getObjectById( s: SessionData, medioTransferencia: ComprobanteTipo )
    {
        const entity = await this.comprobanteTipoEntity.findByPk( medioTransferencia.id, {
            transaction: s.transaction
        } );

        if ( !entity ) throw new InternalServerErrorException( ERROR.ID_INVALIDATE );

        return new ComprobanteTipo({ ...entity.get() });
    }


    async create( s: SessionData, medioTransferencia: ComprobanteTipo )
    {
        medioTransferencia.set({
            id: await this.getId( s )
        });

        await this.comprobanteTipoEntity.create({
            id: medioTransferencia.id,
            nombre: medioTransferencia.nombre
        }, {
            transaction: s.transaction
        });

        return await this.getObjectById( s, medioTransferencia );
    }


    async update( s: SessionData, medioTransferencia: ComprobanteTipo )
    {
        const [af1] = await this.comprobanteTipoEntity.update({
            nombre: medioTransferencia.nombre
        }, {
            transaction: s.transaction,
            where: {
                id: medioTransferencia.id
            }
        });

        if ( af1 === 0 ) throw new InternalServerErrorException( ERROR.NON_UPDATE );

        return await this.getObjectById( s, medioTransferencia );
    }


    async delete( s: SessionData, medioTransferencia: ComprobanteTipo )
    {
        const af1 = await this.comprobanteTipoEntity.destroy({
            transaction: s.transaction,
            where: {
                id: medioTransferencia.id
            }
        })

        if ( af1 === 0 ) throw new InternalServerErrorException( ERROR.NON_DELETE );
    }
}