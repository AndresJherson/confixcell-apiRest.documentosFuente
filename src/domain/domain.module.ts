import { Module } from '@nestjs/common';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import { DbPresetService } from './application/preset/db-preset.service';
import { MovimientoRecursoService } from './application/movimientos-recurso/movimiento-recurso.service';
import { EntradaEfectivoService } from './application/movimientos-recurso/entrada/entrada-efectivo.service';
import { EntradaBienConsumoService } from './application/movimientos-recurso/entrada/entrada-bien-consumo.service';
import { SalidaEfectivoService } from './application/movimientos-recurso/salida/salida-efectivo.service';
import { SalidaBienConsumoService } from './application/movimientos-recurso/salida/salida-bien-consumo.service';
import { SalidaProduccionService } from './application/movimientos-recurso/salida/salida-produccion.service';
import { DocumentoFuenteService } from './application/documentos-fuente/documento-fuente.service';
import { DocumentoMovimientoService } from './application/documentos-fuente/documentos-movimiento/documento-movimiento.service';
import { DocumentoEntradaEfectivoService } from './application/documentos-fuente/documentos-movimiento/entrada/documento-entrada-efectivo.service';
import { DocumentoEntradaBienConsumoService } from './application/documentos-fuente/documentos-movimiento/entrada/documento-entrada-bien-consumo.service';
import { DocumentoSalidaEfectivoService } from './application/documentos-fuente/documentos-movimiento/salida/documento-salida-efectivo.service';
import { DocumentoSalidaBienConsumoService } from './application/documentos-fuente/documentos-movimiento/salida/documento-salida-bien-consumo.service';
import { DocumentoTransaccionService } from './application/documentos-fuente/documentos-transaccion/documento-transaccion.service';
import { NotaTransaccionEntradaService } from './application/documentos-fuente/documentos-transaccion/nota-transaccion-entrada/nota-transaccion-entrada.service';
import { ComprobanteTipoService } from './application/documentos-fuente/documentos-transaccion/nota-transaccion-entrada/comprobante-tipo.service';
import { NotaTransaccionSalidaService } from './application/documentos-fuente/documentos-transaccion/nota-transaccion-salida/nota-transaccion-salida.service';
import { NotaVentaService } from './application/documentos-fuente/documentos-transaccion/nota-venta/nota-venta.service';
import { NvCategoriaReparacionService } from './application/documentos-fuente/documentos-transaccion/nota-venta/nv-categoria-reparacion.service';
import { NvEstadoService } from './application/documentos-fuente/documentos-transaccion/nota-venta/nv-estado.service';
import { NvPrioridadService } from './application/documentos-fuente/documentos-transaccion/nota-venta/nv-prioridad.service';
import { NotaService } from './application/documentos-fuente/nota/nota.service';
import { LiquidacionTipoService } from './application/documentos-fuente/liquidacion-tipo.service';
import { MedioTransferenciaService } from './application/documentos-fuente/medio-transferencia.service';

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
    ],
    exports: [
        InfrastructureModule,
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
