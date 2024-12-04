import { ApiDropdownInput, Button, ExpirationInput, QuantityInput, StructuredForm, UnitOfMeasurementInput } from "./form.js";
import { loadCustomization } from "./load-customization.js";
import { defaultStatusCode, getParameter } from "./utils.js";
await loadCustomization();
const stockId = getParameter(/^.+\/stocks\/(\d+)\/edit.*$/);
const expirationInput = new ExpirationInput('expiration', 'Expiration:', 'Input Expiration');
const productInput = new ApiDropdownInput('productId', 'Product:', '/api/products', (id) => {
    $.ajax({
        url: '/api/products/' + id,
        method: 'GET',
        contentType: 'application/json',
        success: (res) => {
            quantityInput.precompile(res.defaultQuantity);
            unitOfMeasurementInput.precompile(res.defaultUnitOfMeasurement);
            locationInput.precompile(res.defaultLocationId);
        },
        statusCode: defaultStatusCode
    });
});
const quantityInput = new QuantityInput('quantity', 'Quantity', 'Input Quantity');
const unitOfMeasurementInput = new UnitOfMeasurementInput('unitOfMeasurement', 'Unit of Measurement');
const locationInput = new ApiDropdownInput('locationId', 'Location:', '/api/locations');
class EditStockForm extends StructuredForm {
    constructor() {
        super('stock-edit-form', '/api/stocks/{productId}', 'PATCH', [
            expirationInput,
            productInput,
            quantityInput,
            unitOfMeasurementInput,
            locationInput
        ], new Button('Edit', '/img/confirm.svg', true), (res) => {
            window.location.href = '/stocks';
        }, defaultStatusCode, undefined, true);
    }
    async getUrl() {
        return this.url.replace('{productId}', stockId);
    }
    precompile(res) {
        expirationInput.precompile(new Date(res.expiration).toLocaleDateString('en-ZA'));
        productInput.precompile(res.productId);
        quantityInput.precompile(res.quantity);
        unitOfMeasurementInput.precompile(res.unitOfMeasurement);
        locationInput.precompile(res.locationId);
    }
}
const editStockForm = new EditStockForm();
