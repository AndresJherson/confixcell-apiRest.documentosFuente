import { Module } from '@nestjs/common';
import { ConectorService } from './services/conector.service';
import { DbPresetService } from './repositories/preset/db-preset.service';
import { NotaTransaccionEntradaService } from './repositories/documentos-fuente/documentos-transaccion/nota-transaccion-entrada/nota-transaccion-entrada.service';
import { NotaTransaccionSalidaService } from './repositories/documentos-fuente/documentos-transaccion/nota-transaccion-salida/nota-transaccion-salida.service';
import { NotaVentaService } from './repositories/documentos-fuente/documentos-transaccion/nota-venta/nota-venta.service';
import { DocumentoEntradaEfectivoService } from './repositories/documentos-fuente/documentos-movimiento/entrada/documento-entrada-efectivo.service';
import { DocumentoEntradaBienConsumoService } from './repositories/documentos-fuente/documentos-movimiento/entrada/documento-entrada-bien-consumo.service';
import { DocumentoSalidaBienConsumoService } from './repositories/documentos-fuente/documentos-movimiento/salida/documento-salida-bien-consumo.service';
import { DocumentoSalidaEfectivoService } from './repositories/documentos-fuente/documentos-movimiento/salida/documento-salida-efectivo.service';
import { DocumentoMovimientoService } from './repositories/documentos-fuente/documentos-movimiento/documento-movimiento.service';
import { DocumentoTransaccionService } from './repositories/documentos-fuente/documentos-transaccion/documento-transaccion.service';
import { DocumentoFuenteService } from './repositories/documentos-fuente/documento-fuente.service';
import { EntradaEfectivoService } from './repositories/movimientos-recurso/entrada/entrada-efectivo.service';
import { EntradaBienConsumoService } from './repositories/movimientos-recurso/entrada/entrada-bien-consumo.service';
import { SalidaBienConsumoService } from './repositories/movimientos-recurso/salida/salida-bien-consumo.service';
import { SalidaEfectivoService } from './repositories/movimientos-recurso/salida/salida-efectivo.service';
import { NotaService } from './repositories/documentos-fuente/nota/nota.service';
import { DocumentoEntradaEfectivoController } from './controllers/documentos-fuente/documentos-movimiento/entrada/documento-entrada-efectivo.controller';
import { SalidaProduccionService } from './repositories/movimientos-recurso/salida/salida-produccion.service';
import { MedioTransferenciaService } from './repositories/documentos-fuente/medio-transferencia.service';
import { ComprobanteTipoService } from './repositories/documentos-fuente/documentos-transaccion/nota-transaccion-entrada/comprobante-tipo.service';
import { NvPrioridadService } from './repositories/documentos-fuente/documentos-transaccion/nota-venta/nv-prioridad.service';
import { NvEstadoService } from './repositories/documentos-fuente/documentos-transaccion/nota-venta/nv-estado.service';
import { NvCategoriaReparacionService } from './repositories/documentos-fuente/documentos-transaccion/nota-venta/nv-categoria-reparacion.service';
import { DocumentoFuenteController } from './controllers/documentos-fuente/documento-fuente.controller';
import { DocumentoMovimientoController } from './controllers/documentos-fuente/documentos-movimiento/documento-movimiento.controller';
import { DocumentoTransaccionController } from './controllers/documentos-fuente/documentos-transaccion/documento-transaccion.controller';
import { NotaVentaController } from './controllers/documentos-fuente/documentos-transaccion/nota-venta/nota-venta.controller';
import { NotaTransaccionEntradaController } from './controllers/documentos-fuente/documentos-transaccion/nota-transaccion-entrada/nota-transaccion-entrada.controller';
import { NotaTransaccionSalidaController } from './controllers/documentos-fuente/documentos-transaccion/nota-transaccion-salida/nota-transaccion-salida.controller';
import { DocumentoEntradaBienConsumoController } from './controllers/documentos-fuente/documentos-movimiento/entrada/documento-entrada-bien-consumo.controller';
import { DocumentoSalidaEfectivoController } from './controllers/documentos-fuente/documentos-movimiento/salida/documento-salida-efectivo.controller';
import { DocumentoSalidaBienConsumoController } from './controllers/documentos-fuente/documentos-movimiento/salida/documento-salida-bien-consumo.controller';
import { NotaController } from './controllers/documentos-fuente/nota/nota.controller';
import { NvCategoriaReparacionController } from './controllers/documentos-fuente/documentos-transaccion/nota-venta/nv-categoria-reparacion.controller';
import { NvEstadoController } from './controllers/documentos-fuente/documentos-transaccion/nota-venta/nv-estado.controller';
import { NvPrioridadController } from './controllers/documentos-fuente/documentos-transaccion/nota-venta/nv-prioridad.controller';
import { ComprobanteTipoController } from './controllers/documentos-fuente/documentos-transaccion/nota-transaccion-entrada/comprobante-tipo.controller';
import { MedioTransferenciaController } from './controllers/documentos-fuente/medio-transferencia.controller';
import { LiquidacionTipoController } from './controllers/documentos-fuente/documentos-transaccion/liquidacion-tipo.controller';
import { LiquidacionTipoService } from './repositories/documentos-fuente/liquidacion-tipo.service';
import { IntegridadController } from './controllers/integridad/integridad.controller';
import { IntegridadService } from './services/integridad.service';
import { MovimientoRecursoService } from './repositories/movimientos-recurso/movimiento-recurso.service';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { DomainModule } from './domain/domain.module';
import { InterfaceModule } from './interface/interface.module';

@Module({
    imports: [
        InfrastructureModule,
        DomainModule,
        InterfaceModule
    ],
    controllers: [DocumentoFuenteController, DocumentoMovimientoController, DocumentoTransaccionController, NotaVentaController, NvCategoriaReparacionController, NvEstadoController, NvPrioridadController, NotaTransaccionEntradaController, ComprobanteTipoController, NotaTransaccionSalidaController, DocumentoEntradaEfectivoController, DocumentoEntradaBienConsumoController, DocumentoSalidaEfectivoController, DocumentoSalidaBienConsumoController, NotaController, MedioTransferenciaController, LiquidacionTipoController, IntegridadController],
    providers: [ConectorService, DbPresetService, NotaTransaccionEntradaService, NotaTransaccionSalidaService, NotaVentaService, DocumentoEntradaEfectivoService, DocumentoEntradaBienConsumoService, DocumentoSalidaBienConsumoService, DocumentoSalidaEfectivoService, DocumentoMovimientoService, DocumentoTransaccionService, DocumentoFuenteService, EntradaEfectivoService, EntradaBienConsumoService, SalidaBienConsumoService, SalidaEfectivoService, NotaService, SalidaProduccionService, MedioTransferenciaService, ComprobanteTipoService, NvPrioridadService, NvEstadoService, NvCategoriaReparacionService, LiquidacionTipoService, IntegridadService, MovimientoRecursoService],
})
export class AppModule { }
