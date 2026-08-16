# Custom POS Preparation Receipt

[![Odoo Version](https://img.shields.io/badge/Odoo-18.0-7C4DFF)](https://www.odoo.com/)
[![License](https://img.shields.io/badge/License-LGPL--3-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Production-brightgreen)](#)

Personaliza el ticket de preparación (cambio de orden) del Punto de Venta para que solo muestre las líneas de producto con su referencia interna, junto al logo de la empresa y el nombre del cliente.

---

## ¿Qué resuelve?

El ticket de preparación nativo de Odoo POS incluye un encabezado completo con datos de la empresa y la nota general de la orden, que en cocina o barra se descarta porque solo interesa **qué producto preparar**. Además, no muestra la referencia interna ni el nombre del cliente asociado.

Este módulo reescribe el template `point_of_sale.OrderChangeReceipt` para:

- Quitar el encabezado y la nota general de la orden.
- Quitar el título "New" cuando no aplica.
- Mostrar el logo de la empresa y el nombre del cliente al inicio del cuerpo.
- Formatear cada línea como `[referencia] nombre del producto x cantidad`.

## Características

- Patch OWL sobre `PosStore.prototype`:
  - Precarga del logo de la empresa como data-URL base64.
  - Inyección de `company_id`, `company_logo` y `partner_name` en el resultado de `getPrintingChanges`.
  - Inyección del `default_code` (referencia interna) en cada línea de `getRenderedReceipt`.
  - Espera a que las imágenes terminen de cargar antes de devolver el receipt.
- Override QWeb/XML sobre `point_of_sale.OrderChangeReceipt`:
  - Reemplaza el `receipt-header` y el `<hr>` original.
  - Elimina el bloque de la nota general de la orden.
  - Suprime el título "New".
  - Inserta logo + nombre de cliente antes del `pos-receipt-body`.
  - Cambia el formato de cada línea a `[default_code] display_name x quantity`.

## Arquitectura

```
custom_pos_preparation_receipt/
├── __manifest__.py
├── __init__.py
└── static/
    └── src/
        └── app/
            └── store/
                ├── pos_store.js
                └── order_change_receipt_template.xml
```

No hay modelos Python ni vistas: todo se aplica como assets del frontend del POS.

### Assets registrados

| Bundle | Archivo |
|---|---|
| `point_of_sale._assets_pos` | `static/src/app/store/pos_store.js` |
| `point_of_sale._assets_pos` | `static/src/app/store/order_change_receipt_template.xml` |

### Dependencias

| Módulo | Razón |
|---|---|
| `point_of_sale` | Provee `PosStore` y el template `OrderChangeReceipt` que se parchean. |

## Instalación

1. Copiar la carpeta `custom_pos_preparation_receipt/` al `addons_path`.
2. Actualizar la lista de aplicaciones: `odoo-bin -u base -d <db>`.
3. Instalar **Custom POS Preparation Receipt**.
4. Reiniciar la sesión del POS (cerrar y reabrir) para que los patches JS se carguen.

## Uso

1. Abrir el Punto de Venta.
2. Agregar productos a una orden.
3. Cambiar una cantidad o agregar/eliminar una línea.
4. Confirmar la impresión del **ticket de cambio** (preparation receipt) que va a cocina/barra.

El ticket resultante ya no trae encabezado de empresa ni la nota; muestra el logo + cliente al inicio y cada producto con su referencia interna entre corchetes.

## Tests

El módulo no incluye tests. Validar manualmente:

- Crear una orden con productos que tengan `default_code` definido: el ticket debe mostrar `[ref] nombre x cantidad`.
- Confirmar una venta a un cliente con `name` cargado: el ticket debe mostrar `Cliente: <nombre>` arriba.
- Modificar una línea para disparar `getRenderedReceipt`: el logo debe aparecer centrado.
- En una orden sin `default_code`: la línea debe mostrar solo `nombre x cantidad` (sin corchetes vacíos).

## Glosario

- **OrderChangeReceipt**: Template QWeb/OWL nativo del POS que se imprime cuando cambia una línea (agregada, modificada o removida). Es el "ticket de preparación" que va a cocina.
- **default_code**: Referencia interna del producto (`product.product.default_code`).
- **Patch OWL**: Patrón de extensión de Odoo 18 para modificar comportamiento de componentes JS sin heredarlos formalmente.

## Autor y licencia

- **Autor:** Tecnosoft — [tecnosoft.dev](https://tecnosoft.dev)
- **Licencia:** LGPL-3
- **Versión Odoo:** 18.0