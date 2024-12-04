import { RedirectButton, UnitOfMeasurement } from "./form.js";
import { loadCustomization } from "./load-customization.js";
import { ExpirationTableData, IconActionTableData, IconLinkTableData, LinkTableHeader, QuantityTableData, StringTableData, Table, TableData, TableHeader, TableRow } from "./table.js";
import { defaultStatusCode } from "./utils.js";

await loadCustomization();

type Stock = {
    id: number;
    expiration: string;
    product: { name: string; };
    quantity: number;
    unitOfMeasurement: UnitOfMeasurement;
    location: { name: string; };
};

class StocksTable extends Table {
    public constructor() {
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

    public parseElement(element: Stock): TableRow {
        return new StocksTableRow(element);
    }
}

function remove(id: number): void {
    $.ajax({
        url: '/api/stocks/' + id + '/remove',
        method: 'POST',
        contentType: 'application/json',
        success: (): void => {
            stocksTable.update();
        },
        statusCode: defaultStatusCode
    });
};

function createRemoveTableData(element: Stock): TableData<any> {
    if((element.unitOfMeasurement == UnitOfMeasurement.PIECES && element.quantity <= 1) ||
        (element.unitOfMeasurement != UnitOfMeasurement.PIECES && element.quantity <= 10))
        return new IconLinkTableData(element.id, '/products/{id}/delete', '/img/delete.svg');
    return new IconActionTableData(element.id, (): void => { remove(element.id); }, '/img/remove.svg');
}

class StocksTableRow extends TableRow {
    public parseData(element: Stock): TableData<any>[] {
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