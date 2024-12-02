import { RedirectButton } from "./form.js";
import { loadCustomization } from "./load-customization.js";
import { IconLinkTableData, LinkTableHeader, QuantityTableData, StringTableData, Table, TableHeader, TableRow } from "./table.js";
import { RequireNonNull } from "./utils.js";
await loadCustomization();
class ProductsTable extends Table {
    constructor() {
        super('/api/products', 'products', null, [
            new TableHeader('Name', 'name'),
            new TableHeader('Default Quantity', 'defaultQuantity'),
            new TableHeader('Default Location', 'defaultLocation][name'),
            new LinkTableHeader('Edit')
        ]);
    }
    parseElement(element) {
        return new ProductsTableRow(element);
    }
}
class ProductsTableRow extends TableRow {
    parseData(element) {
        return [
            new StringTableData(element.name),
            new QuantityTableData({ quantity: element.defaultQuantity, unitOfMeasurement: element.defaultUnitOfMeasurement }),
            new StringTableData(element.defaultLocation.name),
            new IconLinkTableData(element.id, '/products/{id}/edit', '/img/edit.svg')
        ];
    }
}
const productsTable = new ProductsTable();
const createButton = new RedirectButton('Create Product', '/img/create.svg', '/products/create');
createButton.appendTo(RequireNonNull.getElementById('products'));
