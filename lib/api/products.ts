import { Request, Response } from "express";
import { findCategory } from "../database/category";
import { findLocation } from "../database/location";
import { countProductPages, createProduct, findProduct, findProducts, updateProduct } from "../database/product";
import { getName, getOrder, getQuantity, getUnitOfMeasurement } from "../validation/semantic-validation";
import { getInt, getObject, getOrUndefined } from "../validation/type-validation";
import { Created, Forbidden, handleException, NoContent, Ok, UnprocessableContent } from "../web/response";
import { validateToken } from "./auth";

export async function getProducts(req: Request, res: Response): Promise<void> {
    try {
        const user = await validateToken(req);
        const page = getOrUndefined(req.query.page, getInt);
        const order = getOrUndefined(req.query.order, getOrder);
        const products = await findProducts(user.id, page, order);
        const pages = await countProductPages();
        new Ok({ products: products, pages: pages }).send(res);
    } catch(e: any) {
        handleException(e, res);
    }
}

export async function postProduct(req: Request, res: Response): Promise<void> {
    try {
        const user = await validateToken(req);
        const body = getObject(req.body);
        const name = getName(body.name);
        const defaultQuantity = getQuantity(body.defaultQuantity);
        const defaultUnitOfMeasurement = getUnitOfMeasurement(body.defaultUnitOfMeasurement);
        const defaultLocationId = getInt(body.defaultLocationId);
        const defaultLocation = await findLocation(defaultLocationId);
        if(defaultLocation.userId != user.id)
            throw new UnprocessableContent();
        const product = await createProduct(user.id, name, defaultQuantity, defaultUnitOfMeasurement, defaultLocationId);
        new Created({ id: product.id }).send(res);
    } catch(e: any) {
        handleException(e, res);
    }
}

export async function getProduct(req: Request, res: Response): Promise<void> {
    try {
        const user = await validateToken(req);
        const id = getInt(req.params.productId);
        const product = await findProduct(id);
        if(product.userId != user.id)
            throw new Forbidden();
        new Ok({
            name: product.name,
            defaultQuantity: product.defaultQuantity,
            defaultUnitOfMeasurement: product.defaultUnitOfMeasurement,
            defaultLocationId: product.defaultLocationId,
        }).send(res);
    } catch(e: any) {
        handleException(e, res);
    }
}

export async function patchProduct(req: Request, res: Response): Promise<void> {
    try {
        const user = await validateToken(req);
        const id = getInt(req.params.productId);
        const body = getObject(req.body);
        const name = getName(body.name);
        const defaultQuantity = getQuantity(body.defaultQuantity);
        const defaultUnitOfMeasurement = getUnitOfMeasurement(body.defaultUnitOfMeasurement);
        const defaultLocationId = getInt(body.defaultLocationId);
        const defaultLocation = await findLocation(defaultLocationId);
        if(defaultLocation.userId != user.id)
            throw new UnprocessableContent();
        const product = await findCategory(id);
        if(product.userId != user.id)
            throw new Forbidden();
        await updateProduct(id, name, defaultQuantity, defaultUnitOfMeasurement, defaultLocationId);
        new NoContent().send(res);
    } catch(e: any) {
        handleException(e, res);
    }
}