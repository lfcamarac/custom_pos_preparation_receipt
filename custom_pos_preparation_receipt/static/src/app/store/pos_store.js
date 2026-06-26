/** @odoo-module */
/* Copyright (c) 2016-Present Tecnosoft (<https://tecnosoft.dev>) */

import { patch } from "@web/core/utils/patch";
import { PosStore } from "@point_of_sale/app/store/pos_store";

patch(PosStore.prototype, {
    // 1. Agregar el nombre del cliente a la info del ticket
    getPrintingChanges(order, diningModeUpdate) {
        const result = super.getPrintingChanges(...arguments);
        result.partner_name = order.partner_id?.name || order.get_partner()?.name || "";
        return result;
    },

    // 2. Inyectar el default_code (referencia interna) a cada línea del ticket de cambio
    async getRenderedReceipt(order, title, lines, fullReceipt = false, diningModeUpdate) {
        for (const line of lines) {
            const product = this.models["product.product"].get(line.product_id);
            if (product) {
                line.default_code = product.default_code || "";
            }
        }
        return await super.getRenderedReceipt(...arguments);
    }
});
