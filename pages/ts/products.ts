import { RedirectButton, UnitOfMeasurement } from "./form.js";
import { loadCustomization } from "./load-customization.js";
import { IconLinkTableData, LinkTableHeader, QuantityTableData, StringTableData, Table, TableData, TableHeader, TableRow } from "./table.js";

await loadCustomization();

type Product = {
    id: number;
    name: string;
    defaultQuantity: number;
    defaultUnitOfMeasurement: UnitOfMeasurement;
    defaultLocation: { name: string };
};

class ProductsTable extends Table {
    public constructor() {
        super('/api/products', 'products', null, [
            new TableHeader('Name', 'name'),
            new TableHeader('Default Quantity', 'defaultQuantity'),
            new TableHeader('Default Location', 'defaultLocation][name'),
            new LinkTableHeader('Edit')
        ]);
    }

    public parseElement(element: Product): TableRow {
        return new ProductsTableRow(element);
    }
}

class ProductsTableRow extends TableRow {
    public parseData(element: Product): TableData<any>[] {
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
const backButton = new RedirectButton('Back', '/img/back.svg', '/');