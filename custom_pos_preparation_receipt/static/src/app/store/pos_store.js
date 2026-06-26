/** @odoo-module */
/* Copyright (c) 2016-Present Tecnosoft (<https://tecnosoft.dev>) */

import { patch } from "@web/core/utils/patch";
import { PosStore } from "@point_of_sale/app/store/pos_store";

patch(PosStore.prototype, {
    // 1. Agregar el ID de la empresa y el nombre del cliente a la info del ticket
    getPrintingChanges(order, diningModeUpdate) {
        const result = super.getPrintingChanges(...arguments);
        return {
            ...result,
            company_id: this.company.id,
            partner_name: order.get_partner()?.name || order.partner_id?.name || "",
        };
    },

    // 2. Inyectar el default_code (referencia interna) a cada línea del ticket de cambio
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
        const receipt = await super.getRenderedReceipt(order, title, modifiedLines, fullReceipt, diningModeUpdate);
        const imgs = receipt.querySelectorAll("img");
        if (imgs.length > 0) {
            const promises = Array.from(imgs).map(img => {
                if (img.complete) {
                    return Promise.resolve();
                }
                return new Promise(resolve => {
                    img.onload = resolve;
                    img.onerror = resolve;
                });
            });
            await Promise.all(promises);
        }
        return receipt;
    }
});
