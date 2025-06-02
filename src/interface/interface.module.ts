import { Module } from '@nestjs/common';
import { DomainModule } from 'src/domain/domain.module';
import { DocumentoFuenteController } from './controllers/documentos-fuente/documento-fuente.controller';
import { DocumentoMovimientoController } from './controllers/documentos-fuente/documentos-movimiento/documento-movimiento.controller';
import { DocumentoTransaccionController } from './controllers/documentos-fuente/documentos-transaccion/documento-transaccion.controller';
import { NotaVentaController } from './controllers/documentos-fuente/documentos-transaccion/nota-venta/nota-venta.controller';
import { NvCategoriaReparacionController } from './controllers/documentos-fuente/documentos-transaccion/nota-venta/nv-categoria-reparacion.controller';
import { NvEstadoController } from './controllers/documentos-fuente/documentos-transaccion/nota-venta/nv-estado.controller';
import { NvPrioridadController } from './controllers/documentos-fuente/documentos-transaccion/nota-venta/nv-prioridad.controller';
import { NotaTransaccionEntradaController } from './controllers/documentos-fuente/documentos-transaccion/nota-transaccion-entrada/nota-transaccion-entrada.controller';
import { ComprobanteTipoController } from './controllers/documentos-fuente/documentos-transaccion/nota-transaccion-entrada/comprobante-tipo.controller';
import { NotaTransaccionSalidaController } from './controllers/documentos-fuente/documentos-transaccion/nota-transaccion-salida/nota-transaccion-salida.controller';
import { DocumentoEntradaEfectivoController } from './controllers/documentos-fuente/documentos-movimiento/entrada/documento-entrada-efectivo.controller';
import { DocumentoEntradaBienConsumoController } from './controllers/documentos-fuente/documentos-movimiento/entrada/documento-entrada-bien-consumo.controller';
import { DocumentoSalidaEfectivoController } from './controllers/documentos-fuente/documentos-movimiento/salida/documento-salida-efectivo.controller';
import { DocumentoSalidaBienConsumoController } from './controllers/documentos-fuente/documentos-movimiento/salida/documento-salida-bien-consumo.controller';
import { NotaController } from './controllers/documentos-fuente/nota/nota.controller';
import { MedioTransferenciaController } from './controllers/documentos-fuente/medio-transferencia.controller';
import { LiquidacionTipoController } from './controllers/documentos-fuente/documentos-transaccion/liquidacion-tipo.controller';
import { IntegridadController } from './controllers/integridad/integridad.controller';
import { TransactionInterceptor } from './interceptors/transaction.interceptor';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import { EntradaBienConsumoController } from './controllers/movimientos-recurso/entrada/entrada-bien-consumo.controller';
import { SalidaBienConsumoController } from './controllers/movimientos-recurso/salida/salida-bien-consumo.controller';
import { DbPresetController } from './controllers/preset/db-preset.controller';

@Module({
    imports: [
        DomainModule,
        InfrastructureModule
    ],
    controllers: [
        DocumentoFuenteController,
        DocumentoMovimientoController,
        DocumentoTransaccionController,
        NotaVentaController,
        NvCategoriaReparacionController,
        NvEstadoController,
        NvPrioridadController,
        NotaTransaccionEntradaController,
        ComprobanteTipoController,
        NotaTransaccionSalidaController,
        DocumentoEntradaEfectivoController,
        DocumentoEntradaBienConsumoController,
        DocumentoSalidaEfectivoController,
        DocumentoSalidaBienConsumoController,
        NotaController,
        MedioTransferenciaController,
        LiquidacionTipoController,
        IntegridadController,
        EntradaBienConsumoController,
        SalidaBienConsumoController,
        DbPresetController
    ],
    providers: [
        TransactionInterceptor
    ],
    exports: [
        DomainModule,
        TransactionInterceptor
    ]
})
export class InterfaceModule {}
