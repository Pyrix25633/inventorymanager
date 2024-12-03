import { RedirectButton } from "./form.js";
import { loadCustomization } from "./load-customization.js";
import { IconLinkTableData, LinkTableHeader, StringTableData, Table, TableData, TableHeader, TableRow } from "./table.js";

await loadCustomization();

type Category = {
    id: number;
    name: string;
    defaultLocation: { name: string };
};

class CategoriesTable extends Table {
    public constructor() {
        super('/api/categories', 'categories', null, [
            new TableHeader('Name', 'name'),
            new TableHeader('Default Location', 'defaultLocation][name'),
            new LinkTableHeader('Edit')
        ]);
    }

    public parseElement(element: Category): TableRow {
        return new CategoriesTableRow(element);
    }
}

class CategoriesTableRow extends TableRow {
    public parseData(element: Category): TableData<any>[] {
        return [
            new StringTableData(element.name),
            new StringTableData(element.defaultLocation.name),
            new IconLinkTableData(element.id, '/categories/{id}/edit', '/img/edit.svg')
        ];
    }
}

const categoriesTable = new CategoriesTable();

const createButton = new RedirectButton('Create Category', '/img/create.svg', '/categories/create');
const backButton = new RedirectButton('Back', '/img/back.svg', '/');