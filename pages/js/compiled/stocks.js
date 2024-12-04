import { RedirectButton, UnitOfMeasurement } from "./form.js";
import { loadCustomization } from "./load-customization.js";
import { ExpirationTableData, IconActionTableData, IconLinkTableData, LinkTableHeader, QuantityTableData, StringTableData, Table, TableHeader, TableRow } from "./table.js";
import { defaultStatusCode } from "./utils.js";
await loadCustomization();
class StocksTable extends Table {
    constructor() {
        super('/api/stocks', 'stocks', null, [
            new TableHeader('Expiration', 'expiration'),
            new TableHeader('Product', 'product][name'),
            new TableHeader('Quantity', 'quantity'),
            new TableHeader('Location', 'location][name'),
            new LinkTableHeader('Remove'),
            new LinkTableHeader('Edit'),
            new LinkTableHeader('Delete'),
        ]);
    }
    parseElement(element) {
        return new StocksTableRow(element);
    }
}
function remove(id) {
    $.ajax({
        url: '/api/stocks/' + id + '/remove',
        method: 'POST',
        contentType: 'application/json',
        success: () => {
            stocksTable.update();
        },
        statusCode: defaultStatusCode
    });
}
;
function createRemoveTableData(element) {
    if ((element.unitOfMeasurement == UnitOfMeasurement.PIECES && element.quantity <= 1) ||
        (element.unitOfMeasurement != UnitOfMeasurement.PIECES && element.quantity <= 10))
        return new IconLinkTableData(element.id, '/products/{id}/delete', '/img/delete.svg');
    return new IconActionTableData(element.id, () => { remove(element.id); }, '/img/remove.svg');
}
class StocksTableRow extends TableRow {
    parseData(element) {
        return [
            new ExpirationTableData(element.expiration),
            new StringTableData(element.product.name),
            new QuantityTableData({ quantity: element.quantity, unitOfMeasurement: element.unitOfMeasurement }),
            new StringTableData(element.location.name),
            createRemoveTableData(element),
            new IconLinkTableData(element.id, '/stocks/{id}/edit', '/img/edit.svg'),
            new IconLinkTableData(element.id, '/stocks/{id}/delete', '/img/delete.svg'),
        ];
    }
}
const stocksTable = new StocksTable();
const createButton = new RedirectButton('Create Stock', '/img/create.svg', '/stocks/create');
const backButton = new RedirectButton('Back', '/img/back.svg', '/');
