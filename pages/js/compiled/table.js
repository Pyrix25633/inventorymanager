import { UnitOfMeasurement } from "./form.js";
import { defaultStatusCode, RequireNonNull } from "./utils.js";
export class Table {
    constructor(url, resourceName, groups, headers, footer = true) {
        var _a;
        this.url = url;
        this.resourceName = resourceName;
        this.table = RequireNonNull.getElementById('table');
        const head = document.createElement('thead');
        this.table.appendChild(head);
        if (groups !== null) {
            this.groupsRow = document.createElement('tr');
            head.appendChild(this.groupsRow);
        }
        else
            this.groupsRow = null;
        this.headersRow = document.createElement('tr');
        head.appendChild(this.headersRow);
        this.headers = headers;
        this.order = [];
        this.addToOrder({ [headers[0].column]: 'asc' }, false);
        for (const header of headers)
            header.appendTo(this);
        this.groups = groups;
        for (const group of groups !== null && groups !== void 0 ? groups : [])
            group.appendTo(this);
        this.body = document.createElement('tbody');
        this.table.appendChild(this.body);
        this.page = 0;
        this.footer = footer ? new TableFooter(this) : null;
        (_a = this.footer) === null || _a === void 0 ? void 0 : _a.appendTo(this);
        this.update();
    }
    appendChild(node) {
        this.table.appendChild(node);
    }
    appendChildToGroups(node) {
        var _a;
        (_a = this.groupsRow) === null || _a === void 0 ? void 0 : _a.appendChild(node);
    }
    appendChildToHeaders(node) {
        this.headersRow.appendChild(node);
    }
    appendChildToBody(node) {
        this.body.appendChild(node);
    }
    getOrder(column) {
        for (const value of this.order) {
            const key = Object.keys(value)[0];
            if (key == column)
                return value[key];
        }
        return undefined;
    }
    removeFromOrder(column, update = true) {
        for (let i = 0; i < this.order.length; i++) {
            if (Object.keys(this.order[i])[0] == column) {
                this.order.splice(i, 1);
            }
        }
        if (!update)
            return;
        this.updateHeadersOrder();
        this.update();
    }
    addToOrder(order, update = true) {
        this.removeFromOrder(Object.keys(order)[0], false);
        this.order.push(order);
        this.updateHeadersOrder();
        if (update)
            this.update();
    }
    updateHeadersOrder() {
        for (const header of this.headers) {
            let found = false;
            for (let i = 0; i < this.order.length; i++) {
                const key = Object.keys(this.order[i])[0];
                if (key == header.column) {
                    found = true;
                    header.updateOrder(this.order[i][key]);
                    break;
                }
            }
            if (!found)
                header.updateOrder(undefined);
        }
    }
    getPage() {
        return this.page;
    }
    setPage(page) {
        this.page = page;
        this.update();
    }
    update() {
        const data = { page: undefined, order: this.order };
        if (this.footer != null)
            data.page = this.page;
        $.ajax({
            url: this.url,
            method: 'GET',
            data: data,
            contentType: 'application/json',
            success: (res) => {
                var _a;
                (_a = this.footer) === null || _a === void 0 ? void 0 : _a.update(new PageHelper(this.page, res.pages));
                this.body.innerHTML = '';
                for (const element of res[this.resourceName]) {
                    const row = this.parseElement(element);
                    row.appendTo(this);
                }
            },
            statusCode: defaultStatusCode
        });
    }
}
class GenericTableHeader {
    constructor(text) {
        this.text = text;
    }
}
export var Extra;
(function (Extra) {
    Extra[Extra["Link"] = 0] = "Link";
})(Extra || (Extra = {}));
export class TableHeader extends GenericTableHeader {
    constructor(text, column, extra = undefined) {
        super(text);
        this.column = column;
        this.orderImg = document.createElement('img');
        this.orderImg.classList.add('button');
        this.orderImg.alt = 'Order Icon';
        this.order = undefined;
        this.extra = extra;
    }
    appendTo(table) {
        const th = document.createElement('th');
        const div = document.createElement('div');
        div.classList.add('container');
        const span = document.createElement('span');
        span.classList.add('th');
        if (this.extra == Extra.Link)
            span.classList.add('link');
        span.innerText = this.text;
        if (this.extra != Extra.Link) {
            this.order = table.getOrder(this.column);
            this.updateOrder(this.order);
            this.orderImg.addEventListener('click', () => {
                this.order = this.order == undefined ? 'asc' : (this.order == 'asc' ? 'desc' : undefined);
                if (this.order == undefined)
                    table.removeFromOrder(this.column);
                else
                    table.addToOrder({ [this.column]: this.order });
            });
        }
        div.appendChild(span);
        if (this.extra != Extra.Link)
            div.appendChild(this.orderImg);
        th.appendChild(div);
        table.appendChildToHeaders(th);
    }
    updateOrder(order) {
        this.orderImg.src = '/img/order' + (order != undefined ? '-' + (order == 'asc' ? 'ascending' : 'descending') : '') + '.svg';
    }
}
export class LinkTableHeader extends TableHeader {
    constructor(text) {
        super(text, '', Extra.Link);
    }
}
export class TableHeaderGroup extends GenericTableHeader {
    constructor(text, colspan) {
        super(text);
        this.colspan = colspan;
    }
    appendTo(table) {
        const th = document.createElement('th');
        th.innerText = this.text;
        th.classList.add('group');
        th.colSpan = this.colspan;
        table.appendChildToGroups(th);
    }
}
export class EmptyTableHeaderGroup extends TableHeaderGroup {
    constructor() {
        super('', 0);
    }
    appendTo(table) {
        const th = document.createElement('th');
        table.appendChildToGroups(th);
    }
}
export class TableData {
    constructor(value) {
        this.value = value;
    }
    createTd() {
        const td = document.createElement('td');
        td.innerText = this.value != null ? this.value.toString() : 'null';
        if (this.value == null)
            td.classList.add('null');
        return td;
    }
    appendTo(row) {
        row.appendChild(this.createTd());
    }
    ;
}
export class StringTableData extends TableData {
}
export class BooleanTableData extends TableData {
    createTd() {
        const td = super.createTd();
        if (this.value != null)
            td.classList.add(this.value.toString());
        return td;
    }
}
export class NumberTableData extends TableData {
}
export class QuantityTableData extends TableData {
    createTd() {
        var _a;
        const td = super.createTd();
        if (this.value == null)
            throw new Error('Invalid Quantity!');
        td.innerText = this.value.quantity.toString() + ' ';
        switch ((_a = this.value) === null || _a === void 0 ? void 0 : _a.unitOfMeasurement) {
            case UnitOfMeasurement.PIECES:
                td.innerText += 'pcs';
                break;
            case UnitOfMeasurement.GRAMS:
                td.innerText += 'g';
                break;
            default: td.innerText += 'ml';
        }
        return td;
    }
}
export class LinkTableData extends TableData {
    constructor(value, href) {
        super(value);
        this.href = href;
    }
    createTd() {
        var _a;
        const td = document.createElement('td');
        const a = document.createElement('a');
        a.innerText = (_a = this.value) !== null && _a !== void 0 ? _a : '';
        a.href = this.href;
        td.appendChild(a);
        return td;
    }
}
export class IconLinkTableData extends TableData {
    constructor(value, href, src) {
        super(value);
        this.href = href;
        this.src = src;
    }
    createTd() {
        const td = document.createElement('td');
        const div = document.createElement('div');
        div.classList.add('container');
        const img = document.createElement('img');
        img.classList.add('button');
        img.alt = 'Link Icon';
        img.src = this.src;
        img.addEventListener('click', () => {
            var _a, _b;
            window.location.href = this.href.replace('{id}', (_b = (_a = this.value) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '');
        });
        div.appendChild(img);
        td.appendChild(div);
        return td;
    }
}
export class TableRow {
    constructor(element) {
        this.tableData = this.parseData(element);
        this.row = document.createElement('tr');
        for (const data of this.tableData)
            data.appendTo(this);
    }
    appendChild(node) {
        this.row.appendChild(node);
    }
    appendTo(table) {
        table.appendChildToBody(this.row);
    }
}
export class PageHelper {
    constructor(current, total) {
        this.first = 0;
        this.previous = current - 1;
        if (this.previous < 0)
            this.previous = 0;
        this.current = current;
        this.last = total - 1;
        if (this.last < 0)
            this.last = 0;
        this.next = current + 1;
        if (this.next > this.last)
            this.next = this.last;
        this.total = total;
    }
}
export class TableFooter {
    constructor(table) {
        this.currentInputTimeout = undefined;
        this.first = TableFooter.createImage('First', 'first');
        this.first.addEventListener('click', () => {
            table.setPage(this.pageHelper.first);
        });
        this.previous = TableFooter.createImage('Previous', 'previous');
        this.previous.addEventListener('click', () => {
            table.setPage(this.pageHelper.previous);
        });
        this.current = document.createElement('input');
        this.current.type = 'number';
        this.current.id = 'page';
        this.current.classList.add('small');
        const currentInputHandler = () => {
            table.setPage(parseInt(this.current.value));
        };
        this.current.addEventListener('keyup', () => {
            clearTimeout(this.currentInputTimeout);
            this.currentInputTimeout = setTimeout(currentInputHandler, 1000);
        });
        this.current.addEventListener('keydown', () => {
            clearTimeout(this.currentInputTimeout);
        });
        this.current.addEventListener('focusout', () => {
            clearTimeout(this.currentInputTimeout);
            currentInputHandler();
        });
        this.total = document.createElement('span');
        this.next = TableFooter.createImage('Next', 'next');
        this.next.addEventListener('click', () => {
            table.setPage(this.pageHelper.next);
        });
        this.last = TableFooter.createImage('Last', 'last');
        this.last.addEventListener('click', () => {
            table.setPage(this.pageHelper.last);
        });
        this.pageHelper = new PageHelper(table.getPage(), 0);
        this.update(this.pageHelper);
    }
    static createImage(name, id) {
        const img = document.createElement('img');
        img.classList.add('button');
        img.alt = name + ' Icon';
        img.src = '/img/page-' + id + '.svg';
        return img;
    }
    appendTo(table) {
        const tfoot = document.createElement('tfoot');
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 100;
        const div = document.createElement('div');
        div.classList.add('container');
        div.appendChild(this.first);
        div.appendChild(this.previous);
        const label = document.createElement('label');
        label.htmlFor = 'page';
        label.innerText = 'Page';
        div.appendChild(label);
        div.appendChild(this.current);
        const slash = document.createTextNode('/');
        div.appendChild(slash);
        div.appendChild(this.total);
        div.appendChild(this.next);
        div.appendChild(this.last);
        td.appendChild(div);
        tr.appendChild(td);
        tfoot.appendChild(tr);
        table.appendChild(tfoot);
    }
    update(pageHelper) {
        this.pageHelper = pageHelper;
        this.current.value = (this.pageHelper.current + 1).toString();
        this.total.innerText = this.pageHelper.total.toString();
    }
}
