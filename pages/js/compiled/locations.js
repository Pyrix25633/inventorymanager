import { loadCustomization } from "./load-customization.js";
import { IconLinkTableData, LinkTableHeader, StringTableData, Table, TableHeader, TableRow } from "./table.js";
await loadCustomization();
class LocationsTable extends Table {
    constructor() {
        super('/api/locations', 'locations', null, [
            new TableHeader('Name', 'name'),
            new LinkTableHeader('Edit')
        ], false);
    }
    parseElement(element) {
        return new LocationsTableRow(element);
    }
}
class LocationsTableRow extends TableRow {
    parseData(element) {
        return [
            new StringTableData(element.name),
            new IconLinkTableData(element.id, '/locations/{id}/edit', '/img/edit.svg')
        ];
    }
}
const locationsTable = new LocationsTable();
