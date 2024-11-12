import { loadCustomization } from "./load-customization.js";
import { IconLinkTableData, LinkTableHeader, StringTableData, Table, TableData, TableHeader, TableRow } from "./table.js";

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