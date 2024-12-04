import { ApiDropdownInput, ApiFeedbackInput, Button, QuantityInput, StructuredForm, UnitOfMeasurementInput } from "./form.js";
import { loadCustomization } from "./load-customization.js";
import { defaultStatusCode, getParameter } from "./utils.js";
await loadCustomization();
const productId = getParameter(/^.+\/products\/(\d+)\/edit.*$/);
const nameInput = new ApiFeedbackInput('name', 'text', 'Name:', 'Input Product Name', '/api/feedbacks/product-name');
const defaultQuantityInput = new QuantityInput('defaultQuantity', 'Default Quantity', 'Input Quantity');
const defaultUnitOfMeasurementInput = new UnitOfMeasurementInput('defaultUnitOfMeasurement', 'Default Unit of Measurement');
const defaultLocationInput = new ApiDropdownInput('defaultLocationId', 'Default Location:', '/api/locations');
class EditProductForm extends StructuredForm {
    constructor() {
        super('product-edit-form', '/api/products/{productId}', 'PATCH', [
            nameInput,
            defaultQuantityInput,
            defaultUnitOfMeasurementInput,
            defaultLocationInput
        ], new Button('Edit', '/img/confirm.svg', true), (res) => {
            window.location.href = '/products';
        }, defaultStatusCode, undefined, true);
    }
    async getUrl() {
        return this.url.replace('{productId}', productId);
    }
    precompile(res) {
        nameInput.precompile(res.name);
        defaultQuantityInput.precompile(res.defaultQuantity);
        defaultUnitOfMeasurementInput.precompile(res.defaultUnitOfMeasurement);
        defaultLocationInput.precompile(res.defaultLocationId);
    }
}
const editProductForm = new EditProductForm();
