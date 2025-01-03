import { RedirectButton } from "./form.js";
import { loadCustomization } from "./load-customization.js";
import { RequireNonNull } from "./utils.js";

await loadCustomization();

const indexDiv = RequireNonNull.getElementById('index');

const locationsButton = new RedirectButton('Locations', '/img/locations.svg', '/locations', false);
locationsButton.appendTo(indexDiv);
const productsButton = new RedirectButton('Products', '/img/products.svg', '/products', false);
productsButton.appendTo(indexDiv);
const stocksButton = new RedirectButton('Stocks', '/img/stocks.svg', '/stocks', false);
stocksButton.appendTo(indexDiv);
const categoriesButton = new RedirectButton('Categories', '/img/categories.svg', '/categories', false);
categoriesButton.appendTo(indexDiv);
const booksButton = new RedirectButton('Books', '/img/books.svg', '/books', false);
booksButton.appendTo(indexDiv);