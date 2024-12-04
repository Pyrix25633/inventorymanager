import { Button, StructuredForm } from "./form.js";
import { loadCustomization } from "./load-customization.js";
import { defaultStatusCode, getParameter } from "./utils.js";
await loadCustomization();
const stockId = getParameter(/^.+\/stocks\/(\d+)\/delete.*$/);
class DeleteStockForm extends StructuredForm {
    constructor() {
        super('stock-delete-form', '/api/stocks/{stockId}', 'DELETE', [], new Button('Delete', '/img/confirm.svg', true), (res) => {
            window.location.href = '/books';
        }, defaultStatusCode, undefined);
    }
    async getUrl() {
        return this.url.replace('{stockId}', stockId);
    }
}
const deleteStockForm = new DeleteStockForm();
