import { Button } from "./form.js";
import { loadCustomization } from "./load-customization.js";
import { IconLinkTableData, LinkTableHeader, StringTableData, Table, TableHeader, TableRow } from "./table.js";
import { RequireNonNull } from "./utils.js";
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
const createButton = new Button('Create Location', '/img/create.svg');
createButton.setDisabled(false);
createButton.addClickListener(() => {
    window.location.href = '/locations/create';
});
createButton.appendTo(RequireNonNull.getElementById('locations'));
