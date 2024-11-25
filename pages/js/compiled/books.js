import { RedirectButton } from "./form.js";
import { loadCustomization } from "./load-customization.js";
import { IconLinkTableData, LinkTableHeader, StringTableData, Table, TableHeader, TableRow } from "./table.js";
import { RequireNonNull } from "./utils.js";
await loadCustomization();
class BooksTable extends Table {
    constructor() {
        super('/api/books', 'books', null, [
            new TableHeader('Category', 'category][name'),
            new TableHeader('Title', 'title'),
            new TableHeader('Location', 'location][name'),
            new LinkTableHeader('Edit'),
            new LinkTableHeader('Delete')
        ]);
    }
    parseElement(element) {
        return new BooksTableRow(element);
    }
}
class BooksTableRow extends TableRow {
    parseData(element) {
        return [
            new StringTableData(element.category.name),
            new StringTableData(element.title),
            new StringTableData(element.location.name),
            new IconLinkTableData(element.id, '/books/{id}/edit', '/img/edit.svg'),
            new IconLinkTableData(element.id, '/books/{id}/delete', '/img/delete.svg')
        ];
    }
}
const booksTable = new BooksTable();
const createButton = new RedirectButton('Create Book', '/img/create.svg', '/books/create');
createButton.appendTo(RequireNonNull.getElementById('books'));
