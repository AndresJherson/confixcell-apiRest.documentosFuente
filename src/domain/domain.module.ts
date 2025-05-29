import { Module } from '@nestjs/common';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import { MovimientoRecursoService } from './application/movimiento-recurso/movimiento-recurso.service';
import { EntradaEfectivoService } from './application/movimiento-recurso/entrada/entrada-efectivo.service';
import { EntradaBienConsumoService } from './application/movimiento-recurso/entrada/entrada-bien-consumo.service';
import { SalidaEfectivoService } from './application/movimiento-recurso/salida/salida-efectivo.service';
import { SalidaBienConsumoService } from './application/movimiento-recurso/salida/salida-bien-consumo.service';
import { SalidaProduccionService } from './application/movimiento-recurso/salida/salida-produccion.service';
import { DocumentoFuenteService } from './application/documento-fuente/documento-fuente.service';
import { DocumentoMovimientoService } from './application/documento-fuente/documento-movimiento/documento-movimiento.service';
import { DocumentoEntradaEfectivoService } from './application/documento-fuente/documento-movimiento/entrada/documento-entrada-efectivo.service';
import { DocumentoEntradaBienConsumoService } from './application/documento-fuente/documento-movimiento/entrada/documento-entrada-bien-consumo.service';
import { DocumentoSalidaEfectivoService } from './application/documento-fuente/documento-movimiento/salida/documento-salida-efectivo.service';
import { DocumentoSalidaBienConsumoService } from './application/documento-fuente/documento-movimiento/salida/documento-salida-bien-consumo.service';
import { DocumentoTransaccionService } from './application/documento-fuente/documento-transaccion/documento-transaccion.service';
import { NotaTransaccionEntradaService } from './application/documento-fuente/documento-transaccion/nota-transaccion-entrada/nota-transaccion-entrada.service';
import { ComprobanteTipoService } from './application/documento-fuente/documento-transaccion/nota-transaccion-entrada/comprobante-tipo.service';
import { NotaTransaccionSalidaService } from './application/documento-fuente/documento-transaccion/nota-transaccion-salida/nota-transaccion-salida.service';
import { NotaVentaService } from './application/documento-fuente/documento-transaccion/nota-venta/nota-venta.service';
import { NvCategoriaReparacionService } from './application/documento-fuente/documento-transaccion/nota-venta/nv-categoria-reparacion.service';
import { NvEstadoService } from './application/documento-fuente/documento-transaccion/nota-venta/nv-estado.service';
import { NvPrioridadService } from './application/documento-fuente/documento-transaccion/nota-venta/nv-prioridad.service';
import { NotaService } from './application/documento-fuente/nota/nota.service';
import { LiquidacionTipoService } from './application/documento-fuente/liquidacion-tipo.service';
import { MedioTransferenciaService } from './application/documento-fuente/medio-transferencia.service';
import { DbPresetService } from './application/preset/db-preset.service';

@Module({
    imports: [
        InfrastructureModule
    ],
    providers: [
        MovimientoRecursoService,
        EntradaEfectivoService,
        EntradaBienConsumoService,
        SalidaEfectivoService,
        SalidaBienConsumoService,
        SalidaProduccionService,
        DocumentoFuenteService,
        DocumentoMovimientoService,
        DocumentoEntradaEfectivoService,
        DocumentoEntradaBienConsumoService,
        DocumentoSalidaEfectivoService,
        DocumentoSalidaBienConsumoService,
        DocumentoTransaccionService,
        NotaTransaccionEntradaService,
        ComprobanteTipoService,
        NotaTransaccionSalidaService,
        NotaVentaService,
        NvCategoriaReparacionService,
        NvEstadoService,
        NvPrioridadService,
        NotaService,
        LiquidacionTipoService,
        MedioTransferenciaService,
        DbPresetService
    ]
})
export class DomainModule {}
