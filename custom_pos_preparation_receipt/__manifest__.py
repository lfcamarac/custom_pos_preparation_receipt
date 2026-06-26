# -*- coding: utf-8 -*-
{
    'name': 'Custom POS Preparation Receipt',
    'version': '18.0.1.0.0',
    'summary': 'Simplifica el ticket de preparación del POS dejando solo las líneas de producto',
    'description': """
Extiende el template OWL point_of_sale.OrderChangeReceipt para remover el
encabezado del ticket de preparación y la nota general de la orden, dejando
únicamente las líneas de producto tal como se muestran actualmente.
""",
    'category': 'Point of Sale',
    'author': 'Tecnosoft',
    'depends': ['point_of_sale'],
    'assets': {
        'point_of_sale._assets_pos': [
            'custom_pos_preparation_receipt/static/src/app/store/order_change_receipt_template.xml',
        ],
    },
    'license': 'LGPL-3',
    'installable': True,
    'application': False,
    'auto_install': False,
}
