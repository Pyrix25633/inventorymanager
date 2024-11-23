import { defaultStatusCode, RequireNonNull } from "./utils.js";

type BaseOrderValue = 'asc' | 'desc' | undefined;
type OrderValue = { [index: string]: 'asc' | 'desc'; };
type Order = OrderValue[];

export abstract class Table {
    private readonly url: string;
    private readonly resourceName: string;
    private readonly table: HTMLTableElement;
    private readonly groupsRow: HTMLTableRowElement | null;
    private readonly headersRow: HTMLTableRowElement;
    private readonly groups: TableHeaderGroup[] | null;
    private readonly headers: TableHeader[];
    private order: Order;
    private readonly body: HTMLTableSectionElement;
    private readonly footer: TableFooter | null;
    private page: number;

    public constructor(url: string, resourceName: string, groups: TableHeaderGroup[] | null, headers: TableHeader[], footer: boolean = true) {
        this.url = url;
        this.resourceName = resourceName;

        this.table = RequireNonNull.getElementById('table') as HTMLTableElement;
        const head = document.createElement('thead');
        this.table.appendChild(head);
        if(groups !== null) {
            this.groupsRow = document.createElement('tr');
            head.appendChild(this.groupsRow);
        }
        else
            this.groupsRow = null;
        this.headersRow = document.createElement('tr');
        head.appendChild(this.headersRow);
        this.headers = headers;
        this.order = [];
        this.addToOrder({ [headers[0].column]: 'asc' });
        for(const header of headers)
            header.appendTo(this);
        this.groups = groups;
        for(const group of groups ?? [])
            group.appendTo(this);
        this.body = document.createElement('tbody');
        this.table.appendChild(this.body);

        this.page = 0;
        this.footer = footer ? new TableFooter(this) : null;
        this.footer?.appendTo(this);

        this.update();
    }

    public appendChild(node: HTMLTableSectionElement): void {
        this.table.appendChild(node);
    }

    public appendChildToGroups(node: HTMLTableCellElement): void {
        this.groupsRow?.appendChild(node);
    }

    public appendChildToHeaders(node: HTMLTableCellElement): void {
        this.headersRow.appendChild(node);
    }

    public appendChildToBody(node: HTMLTableRowElement): void {
        this.body.appendChild(node);
    }

    public getOrder(column: string): BaseOrderValue {
        for(const value of this.order) {
            const key = Object.keys(value)[0];
            if(key == column)
                return value[key];
        }
        return undefined;
    }

    public removeFromOrder(column: string, update: boolean = true): void {
        for(let i = 0; i < this.order.length; i++) {
            if(Object.keys(this.order[i])[0] == column) {
                this.order.splice(i, 1);
            }
        }
        if(!update)
            return;
        this.updateHeadersOrder();
        this.update();
    }

    public addToOrder(order: OrderValue): void {
        this.removeFromOrder(Object.keys(order)[0], false);
        this.order.push(order);
        this.updateHeadersOrder();
        this.update();
    }

    public updateHeadersOrder(): void {
        for(const header of this.headers) {
            let found = false;
            for(let i = 0; i < this.order.length; i++) {
                const key = Object.keys(this.order[i])[0];
                if(key == header.column) {
                    found = true;
                    header.updateOrder(this.order[i][key]);
                    break;
                }
            }
            if(!found)
                header.updateOrder(undefined);
        }
    }

    public getPage(): number {
        return this.page;
    }

    public setPage(page: number): void {
        this.page = page;
        this.update();
    }

    public update(): void {
        const data: { page: undefined | number; order: Order; } = { page: undefined, order: this.order };
        if(this.footer != null)
            data.page = this.page;
        $.ajax({
            url: this.url,
            method: 'GET',
            data: data,
            contentType: 'application/json',
            success: (res: { pages: number; [index: string]: any; }): void => {
                this.footer?.update(new PageHelper(this.page, res.pages));
                this.body.innerHTML = '';
                for(const element of res[this.resourceName] as Element[]) {
                    const row = this.parseElement(element);
                    row.appendTo(this);
                }
            },
            statusCode: defaultStatusCode
        });
    }

    public abstract parseElement(element: Element): TableRow;
}

class GenericTableHeader {
    protected readonly text: string;
    
    public constructor(text: string) {
        this.text = text;
    }
}

export enum Extra {
    Link
}

export class TableHeader extends GenericTableHeader {
    public readonly column: string;
    private readonly orderImg: HTMLImageElement;
    private order: BaseOrderValue;
    private readonly extra: Extra | undefined;
    
    public constructor(text: string, column: string, extra: Extra | undefined = undefined) {
        super(text);
        this.column = column;
        this.orderImg = document.createElement('img');
        this.orderImg.classList.add('button');
        this.orderImg.alt = 'Order Icon';
        this.order = undefined;
        this.extra = extra;
    }

    public appendTo(table: Table): void {
        const th = document.createElement('th');
        const div = document.createElement('div');
        div.classList.add('container');
        const span = document.createElement('span');
        span.classList.add('th');
        if(this.extra == Extra.Link)
            span.classList.add('link');
        span.innerText = this.text;
        if(this.extra != Extra.Link) {
            this.order = table.getOrder(this.column);
            this.updateOrder(this.order);
            this.orderImg.addEventListener('click', (): void => {
                this.order = this.order == undefined ? 'asc' : (this.order == 'asc' ? 'desc' : undefined);
                if(this.order == undefined)
                    table.removeFromOrder(this.column);
                else
                    table.addToOrder({ [this.column]: this.order });
            });
        }
        div.appendChild(span);
        if(this.extra != Extra.Link)
            div.appendChild(this.orderImg);
        th.appendChild(div);
        table.appendChildToHeaders(th);
    }

    public updateOrder(order: BaseOrderValue): void {
        this.orderImg.src = '/img/order' + (order != undefined ? '-' + (order == 'asc' ? 'ascending' : 'descending') : '') + '.svg';
    }
}

export class LinkTableHeader extends TableHeader {
    public constructor(text: string) {
        super(text, '', Extra.Link);
    }
}

export class TableHeaderGroup extends GenericTableHeader {
    private readonly colspan: number;

    public constructor(text: string, colspan: number) {
        super(text);
        this.colspan = colspan;
    }

    public appendTo(table: Table): void {
        const th = document.createElement('th');
        th.innerText = this.text;
        th.classList.add('group');
        th.colSpan = this.colspan;
        table.appendChildToGroups(th);
    }
}

export class EmptyTableHeaderGroup extends TableHeaderGroup {
    public constructor() {
        super('', 0);
    }

    public appendTo(table: Table): void {
        const th = document.createElement('th');
        table.appendChildToGroups(th);
    }
}

type Element = { [index: string]: any; };

export abstract class TableData<T> {
    protected readonly value: T | null;
    protected readonly color: number | undefined;

    public constructor(value: T | null) {
        this.value = value;
    }

    public createTd(): HTMLTableCellElement {
        const td = document.createElement('td');
        td.innerText = this.value != null ? this.value.toString() : 'null';
        if(this.value == null)
            td.classList.add('null');
        return td;
    }

    public appendTo(row: TableRow): void {
        row.appendChild(this.createTd());
    };
}

export class StringTableData extends TableData<string> {}

export class BooleanTableData extends TableData<boolean> {
    public createTd(): HTMLTableCellElement {
        const td = super.createTd();
        if(this.value != null)
            td.classList.add(this.value.toString());
        return td;
    }
}

export class NumberTableData extends TableData<number> {}

export class LinkTableData extends TableData<string> {
    private readonly href: string;

    constructor(value: string, href: string) {
        super(value);
        this.href = href;
    }

    public createTd(): HTMLTableCellElement {
        const td = document.createElement('td');
        const a = document.createElement('a');
        a.innerText = this.value ?? '';
        a.href = this.href;
        td.appendChild(a);
        return td;
    }
}

export class IconLinkTableData extends TableData<number> {
    private readonly href: string;
    private readonly src: string;

    constructor(value: number, href: string, src: string) {
        super(value);
        this.href = href;
        this.src = src;
    }

    public createTd(): HTMLTableCellElement {
        const td = document.createElement('td');
        const div = document.createElement('div');
        div.classList.add('container');
        const img = document.createElement('img');
        img.classList.add('button');
        img.alt = 'Link Icon';
        img.src = this.src;
        img.addEventListener('click', () => {
            window.location.href = this.href.replace('{id}', this.value?.toString() ?? '');
        });
        div.appendChild(img);
        td.appendChild(div);
        return td;
    }
}

export abstract class TableRow {
    private readonly tableData: TableData<any>[];
    private readonly row: HTMLTableRowElement;

    public constructor(element: Element) {
        this.tableData = this.parseData(element);
        this.row = document.createElement('tr');
        for(const data of this.tableData)
            data.appendTo(this);
    }

    public abstract parseData(element: Element): TableData<any>[];

    public appendChild(node: HTMLTableCellElement): void {
        this.row.appendChild(node);
    }

    public appendTo(table: Table): void {
        table.appendChildToBody(this.row);
    }
}

export class PageHelper {
    public readonly first: number;
    public readonly previous: number;
    public readonly current: number;
    public readonly next: number;
    public readonly last: number;
    public readonly total: number;

    public constructor(current: number, total: number) {
        this.first = 0;
        this.previous = current - 1;
        if(this.previous < 0) this.previous = 0;
        this.current = current;
        this.last = total - 1;
        if(this.last < 0) this.last = 0;
        this.next = current + 1;
        if(this.next > this.last) this.next = this.last;
        this.total = total;
    }
}

export class TableFooter {
    private readonly first: HTMLImageElement;
    private readonly previous: HTMLImageElement;
    private readonly current: HTMLInputElement;
    private currentInputTimeout: NodeJS.Timeout | undefined = undefined;
    private readonly total: HTMLSpanElement;
    private readonly next: HTMLImageElement;
    private readonly last: HTMLImageElement;
    private pageHelper: PageHelper;

    public constructor(table: Table) {
        this.first = TableFooter.createImage('First', 'first');
        this.first.addEventListener('click', (): void => {
            table.setPage(this.pageHelper.first);
        });

        this.previous = TableFooter.createImage('Previous', 'previous');
        this.previous.addEventListener('click', (): void => {
            table.setPage(this.pageHelper.previous);
        });

        this.current = document.createElement('input');
        this.current.type = 'number';
        this.current.id = 'page';
        this.current.classList.add('small');
        const currentInputHandler = (): void => {
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
        this.next.addEventListener('click', (): void => {
            table.setPage(this.pageHelper.next);
        });

        this.last = TableFooter.createImage('Last', 'last');
        this.last.addEventListener('click', (): void => {
            table.setPage(this.pageHelper.last);
        });

        this.pageHelper = new PageHelper(table.getPage(), 0);
        this.update(this.pageHelper);
    }

    public static createImage(name: string, id: string): HTMLImageElement {
        const img = document.createElement('img');
        img.classList.add('button');
        img.alt = name + ' Icon';
        img.src = '/img/page-' + id + '.svg';
        return img;
    }

    public appendTo(table: Table): void {
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

    public update(pageHelper: PageHelper): void {
        this.pageHelper = pageHelper;
        this.current.value = (this.pageHelper.current + 1).toString();
        this.total.innerText = this.pageHelper.total.toString();
    }
}