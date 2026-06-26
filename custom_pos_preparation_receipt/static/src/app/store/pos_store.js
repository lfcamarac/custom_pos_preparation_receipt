/** @odoo-module */
/* Copyright (c) 2016-Present Tecnosoft (<https://tecnosoft.dev>) */

import { patch } from "@web/core/utils/patch";
import { PosStore } from "@point_of_sale/app/store/pos_store";

patch(PosStore.prototype, {
    // 1. Pre-cargar el logo en base64 cuando se procesen los datos del servidor
    async afterProcessServerData() {
        await super.afterProcessServerData(...arguments);
        if (this.company?.id) {
            const logoUrl = `/web/image?model=res.company&id=${this.company.id}&field=logo`;
            try {
                const response = await fetch(logoUrl);
                const blob = await response.blob();
                const reader = new FileReader();
                await new Promise((resolve, reject) => {
                    reader.onloadend = resolve;
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
                this.company_logo_base64 = reader.result;
            } catch (err) {
                console.error("Error pre-loading company logo base64:", err);
            }
        }
    },

    // 2. Agregar el ID de la empresa, el logo en base64 y el nombre del cliente a la info del ticket
    getPrintingChanges(order, diningModeUpdate) {
        const result = super.getPrintingChanges(...arguments);
        return {
            ...result,
            company_id: this.company.id,
            company_logo: this.company_logo_base64 || "",
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
