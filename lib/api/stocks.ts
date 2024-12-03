import { Request, Response } from "express";
import { countBookPages, deleteBook, findBooks } from "../database/book";
import { findLocation } from "../database/location";
import { findProduct } from "../database/product";
import { createStock, findStock, updateStock } from "../database/stock";
import { getDate, getOrder, getQuantity, getUnitOfMeasurement } from "../validation/semantic-validation";
import { getInt, getObject, getOrUndefined } from "../validation/type-validation";
import { Created, Forbidden, handleException, NoContent, Ok, UnprocessableContent } from "../web/response";
import { validateToken } from "./auth";

export async function getStocks(req: Request, res: Response): Promise<void> {
    try {
        const user = await validateToken(req);
        const page = getOrUndefined(req.query.page, getInt);
        const order = getOrUndefined(req.query.order, getOrder);
        const stocks = await findBooks(user.id, page, order);
        const pages = await countBookPages();
        new Ok({ stocks: stocks, pages: pages }).send(res);
    } catch(e: any) {
        handleException(e, res);
    }
}

export async function postStock(req: Request, res: Response): Promise<void> {
    try {
        const user = await validateToken(req);
        const body = getObject(req.body);
        const expiration = getDate(body.expiration);
        const productId = getInt(body.categoryId);
        const product = await findProduct(productId);
        if(product.userId != user.id)
            throw new UnprocessableContent();
        const quantity = getQuantity(body.quantity);
        const unitOfMeasurement = getUnitOfMeasurement(body.unitOfMeasurement);
        const locationId = getInt(body.locationId);
        const location = await findLocation(locationId);
        if(location.userId != user.id)
            throw new UnprocessableContent();
        const stock = await createStock(user.id, expiration, productId, quantity, unitOfMeasurement, locationId);
        new Created({ id: stock.id }).send(res);
    } catch(e: any) {
        handleException(e, res);
    }
}

export async function getStock(req: Request, res: Response): Promise<void> {
    try {
        const user = await validateToken(req);
        const id = getInt(req.params.stockId);
        const stock = await findStock(id);
        if(stock.userId != user.id)
            throw new Forbidden();
        new Ok({ expiration: stock.expiration, productId: stock.productId, quantity: stock.quantity, unitOfMeasurement: stock.unitOfMeasurement, locationId: stock.locationId }).send(res);
    } catch(e: any) {
        handleException(e, res);
    }
}

export async function patchStock(req: Request, res: Response): Promise<void> {
    try {
        const user = await validateToken(req);
        const id = getInt(req.params.stockId);
        const body = getObject(req.body);
        const expiration = getDate(body.expiration);
        const productId = getInt(body.categoryId);
        const product = await findProduct(productId);
        if(product.userId != user.id)
            throw new UnprocessableContent();
        const quantity = getQuantity(body.quantity);
        const unitOfMeasurement = getUnitOfMeasurement(body.unitOfMeasurement);
        const locationId = getInt(body.locationId);
        const location = await findLocation(locationId);
        if(location.userId != user.id)
            throw new UnprocessableContent();
        await updateStock(id, expiration, productId, quantity, unitOfMeasurement, locationId);
        new NoContent().send(res);
    } catch(e: any) {
        handleException(e, res);
    }
}

export async function delStock(req: Request, res: Response): Promise<void> {
    try {
        const user = await validateToken(req);
        const id = getInt(req.params.stockId);
        const stock = await findStock(id);
        if(stock.userId != user.id)
            throw new Forbidden();
        await deleteBook(id);
        new NoContent().send(res);
    } catch(e: any) {
        handleException(e, res);
    }
}