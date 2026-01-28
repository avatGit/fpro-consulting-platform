const PdfPrinter = require('pdfmake/js/Printer').default;
const path = require('path');
const fs = require('fs');

class PdfService {
    constructor() {
        const fonts = {
            Roboto: {
                normal: path.join(__dirname, '../templates/fonts/Roboto-Regular.ttf'),
                bold: path.join(__dirname, '../templates/fonts/Roboto-Medium.ttf'),
                italics: path.join(__dirname, '../templates/fonts/Roboto-Italic.ttf'),
                bolditalics: path.join(__dirname, '../templates/fonts/Roboto-MediumItalic.ttf')
            }
        };
        this.printer = new PdfPrinter(fonts);
    }

    async generateQuotePdf(quote) {
        const docDefinition = {
            content: [
                { text: 'F-PRO CONSULTING', style: 'header' },
                { text: 'Digital Services Platform', style: 'subheader' },
                { text: '\n\n' },
                {
                    columns: [
                        {
                            text: [
                                { text: 'DEVIS N°: ', bold: true },
                                quote.quote_number,
                                '\n',
                                { text: 'Date: ', bold: true },
                                new Date(quote.created_at).toLocaleDateString(),
                                '\n',
                                { text: 'Valide jusqu\'au: ', bold: true },
                                new Date(quote.valid_until).toLocaleDateString(),
                            ]
                        },
                        {
                            text: [
                                { text: 'Client: ', bold: true },
                                `${quote.user.first_name} ${quote.user.last_name}\n`,
                                { text: 'Entreprise: ', bold: true },
                                quote.company.name,
                                '\n',
                                quote.company.address || '',
                                '\n',
                                quote.company.city || '',
                            ],
                            alignment: 'right'
                        }
                    ]
                },
                { text: '\n\n' },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', 'auto', 'auto', 'auto'],
                        body: [
                            [
                                { text: 'Désignation', style: 'tableHeader' },
                                { text: 'Prix Unitaire', style: 'tableHeader' },
                                { text: 'Quantité', style: 'tableHeader' },
                                { text: 'Total HT', style: 'tableHeader' }
                            ],
                            ...quote.items.map(item => [
                                item.product.name,
                                `${parseFloat(item.unit_price).toFixed(2)} FCFA`,
                                item.quantity.toString(),
                                `${parseFloat(item.subtotal).toFixed(2)} FCFA`
                            ])
                        ]
                    },
                    layout: 'lightHorizontalLines'
                },
                { text: '\n' },
                {
                    columns: [
                        {},
                        {
                            width: 200,
                            table: {
                                widths: ['*', 'auto'],
                                body: [
                                    ['Total HT', `${parseFloat(quote.subtotal).toFixed(2)} FCFA`],
                                    ['TVA (18%)', `${parseFloat(quote.vat_amount).toFixed(2)} FCFA`],
                                    [{ text: 'TOTAL TTC', bold: true }, { text: `${parseFloat(quote.total_amount).toFixed(2)} FCFA`, bold: true }]
                                ]
                            },
                            layout: 'noBorders'
                        }
                    ]
                },
                { text: '\n\n' },
                { text: 'Merci pour votre confiance.', style: 'footer' }
            ],
            styles: {
                header: { fontSize: 22, bold: true, color: '#2c3e50' },
                subheader: { fontSize: 12, italics: true, color: '#7f8c8d' },
                tableHeader: { bold: true, fontSize: 13, color: 'black' },
                footer: { fontSize: 10, italics: true, alignment: 'center' }
            },
            defaultStyle: { font: 'Roboto' }
        };

        return this.printer.createPdfKitDocument(docDefinition);
    }
}

module.exports = new PdfService();
