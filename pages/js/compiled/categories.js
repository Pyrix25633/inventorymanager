import { RedirectButton } from "./form.js";
import { loadCustomization } from "./load-customization.js";
import { IconLinkTableData, LinkTableHeader, StringTableData, Table, TableHeader, TableRow } from "./table.js";
import { RequireNonNull } from "./utils.js";
await loadCustomization();
class CategoriesTable extends Table {
    constructor() {
        super('/api/categories', 'categories', null, [
            new TableHeader('Name', 'name'),
            new TableHeader('Default Location', 'defaultLocation[name]'),
            new LinkTableHeader('Edit')
        ]);
    }
    parseElement(element) {
        return new CategoriesTableRow(element);
    }
}
class CategoriesTableRow extends TableRow {
    parseData(element) {
        return [
            new StringTableData(element.name),
            new StringTableData(element.defaultLocation.name),
            new IconLinkTableData(element.id, '/categories/{id}/edit', '/img/edit.svg')
        ];
    }
}
const categoriesTable = new CategoriesTable();
const createButton = new RedirectButton('Create Category', '/img/create.svg', '/categories/create');
createButton.appendTo(RequireNonNull.getElementById('categories'));
