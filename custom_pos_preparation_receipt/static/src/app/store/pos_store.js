/** @odoo-module */
/* Copyright (c) 2016-Present Tecnosoft (<https://tecnosoft.dev>) */

import { patch } from "@web/core/utils/patch";
import { PosStore } from "@point_of_sale/app/store/pos_store";

patch(PosStore.prototype, {
    // 1. Agregar el nombre del cliente de forma segura en una copia del resultado
    getPrintingChanges(order, diningModeUpdate) {
        const result = super.getPrintingChanges(...arguments);
        return {
            ...result,
            partner_name: order.get_partner()?.name || order.partner_id?.name || "",
        };
    },

    // 2. Clonar las líneas para evitar excepciones de tipo "Read-Only" en los proxies reactivos de Odoo
    async getRenderedReceipt(order, title, lines, fullReceipt = false, diningModeUpdate) {
        const modifiedLines = (lines || []).map(line => {
            if (line && typeof line === "object") {
                const product = this.models["product.product"].get(line.product_id);
                return {
                    ...line,
                    default_code: product ? (product.default_code || "") : "",
                };
            }
            return line;
        });
        return await super.getRenderedReceipt(order, title, modifiedLines, fullReceipt, diningModeUpdate);
    }
});
