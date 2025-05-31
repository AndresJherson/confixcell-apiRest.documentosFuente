import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { EntradaBienConsumoOrm } from 'src/infrastructure/entities/MovimientosRecurso/Entrada/EntradaBienConsumo/EntradaBienConsumoOrm';
import { EntradaBienConsumoValorSalidaOrm } from 'src/infrastructure/entities/MovimientosRecurso/Entrada/EntradaBienConsumo/EntradaBienConsumoValorSalidaOrm';
import { SalidaBienConsumoOrm } from 'src/infrastructure/entities/MovimientosRecurso/Salida/SalidaBienConsumo/SalidaBienConsumoOrm';
import { SalidaBienConsumoValorEntradaOrm } from 'src/infrastructure/entities/MovimientosRecurso/Salida/SalidaBienConsumo/SalidaBienConsumoValorEntradaOrm';
import { SessionData } from 'src/utils/interfaces';

@Injectable()
export class MovimientoRecursoService {

    async verifyUuidReferences( s: SessionData, uuidsMovimientos: string[] )
    {
        const referencedUuidsOfEntradaBienConsumoValorSalida = await EntradaBienConsumoValorSalidaOrm.findAll({
            transaction: s.transaction,
            include: [
                {
                    model: SalidaBienConsumoOrm,
                    where: {
                        uuid: uuidsMovimientos
                    }
                }
            ]
        })
        .then( data => data.map( orm => orm.get().salidaBienConsumoOrm?.get().uuid ).filter( uuid => uuid !== undefined ) )

        if ( referencedUuidsOfEntradaBienConsumoValorSalida.length )
            throw new InternalServerErrorException(`Movimientos de salida de bien de consumo referenciados: ${referencedUuidsOfEntradaBienConsumoValorSalida.join(', ')}`);

        
        const referencedUuidsOfSalidaBienConsumoValorEntrada = await SalidaBienConsumoValorEntradaOrm.findAll({
            transaction: s.transaction,
            include: [
                {
                    model: EntradaBienConsumoOrm,
                    where: {
                        uuid: uuidsMovimientos
                    }
                }
            ]
        })
        .then( data => data.map( orm => orm.get().entradaBienConsumoOrm?.get().uuid ).filter( uuid => uuid !== undefined ) )

        if ( referencedUuidsOfSalidaBienConsumoValorEntrada.length )
            throw new InternalServerErrorException(`Movimiento de entrada de bien de consumo referenciados: ${referencedUuidsOfSalidaBienConsumoValorEntrada.join(', ')}`);
    }
}