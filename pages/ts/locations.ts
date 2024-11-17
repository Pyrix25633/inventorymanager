import { Button } from "./form.js";
import { loadCustomization } from "./load-customization.js";
import { IconLinkTableData, LinkTableHeader, StringTableData, Table, TableData, TableHeader, TableRow } from "./table.js";
import { RequireNonNull } from "./utils.js";

await loadCustomization();

type Location = {
    id: number;
    name: string;
};

class LocationsTable extends Table {
    public constructor() {
        super('/api/locations', 'locations', null, [
            new TableHeader('Name', 'name'),
            new LinkTableHeader('Edit')
        ], false);
    }

    public parseElement(element: Location): TableRow {
        return new LocationsTableRow(element);
    }
}

class LocationsTableRow extends TableRow {
    public parseData(element: Location): TableData<any>[] {
        return [
            new StringTableData(element.name),
            new IconLinkTableData(element.id, '/locations/{id}/edit', '/img/edit.svg')
        ];
    }
}

const locationsTable = new LocationsTable();

const createButton = new Button('Create Location', '/img/create.svg');
createButton.setDisabled(false);
createButton.addClickListener((): void => {
    window.location.href = '/locations/create';
});
createButton.appendTo(RequireNonNull.getElementById('locations'));