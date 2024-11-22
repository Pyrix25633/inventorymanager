import { Request, Response } from "express";
import { createCategory, findCategories, findCategory, updateCategory } from "../database/category";
import { findLocation } from "../database/location";
import { getName, getOrder } from "../validation/semantic-validation";
import { getInt, getObject, getOrUndefined } from "../validation/type-validation";
import { Created, Forbidden, handleException, NoContent, Ok, UnprocessableContent } from "../web/response";
import { validateToken } from "./auth";

export async function getCategories(req: Request, res: Response): Promise<void> {
    try {
        const user = await validateToken(req);
        const page = getOrUndefined(req.query.page, getInt);
        const order = getOrUndefined(req.query.order, getOrder);
        const categories = await findCategories(user.id, page, order);
        new Ok({ categories: categories }).send(res);
    } catch(e: any) {
        handleException(e, res);
    }
}

export async function postCategory(req: Request, res: Response): Promise<void> {
    try {
        const user = await validateToken(req);
        const body = getObject(req.body);
        const name = getName(body.name);
        const defaultLocationId = getInt(body.defaultLocationId);
        const defaultLocation = await findLocation(defaultLocationId);
        if(defaultLocation.userId != user.id)
            throw new UnprocessableContent();
        const category = await createCategory(user.id, name, defaultLocationId);
        new Created({ id: category.id }).send(res);
    } catch(e: any) {
        handleException(e, res);
    }
}

export async function getCategory(req: Request, res: Response): Promise<void> {
    try {
        const user = await validateToken(req);
        const id = getInt(req.params.categoryId);
        const category = await findCategory(id);
        if(category.userId != user.id)
            throw new Forbidden();
        new Ok({ name: category.name, defaultLocationId: category.defaultLocationId }).send(res);
    } catch(e: any) {
        handleException(e, res);
    }
}

export async function patchCategory(req: Request, res: Response): Promise<void> {
    try {
        const user = await validateToken(req);
        const id = getInt(req.params.categoryId);
        const body = getObject(req.body);
        const name = getName(body.name);
        const defaultLocationId = getInt(body.defaultLocationId);
        const defaultLocation = await findLocation(defaultLocationId);
        if(defaultLocation.userId != user.id)
            throw new UnprocessableContent();
        const category = await findCategory(id);
        if(category.userId != user.id)
            throw new Forbidden();
        await updateCategory(id, name, defaultLocationId);
        new NoContent().send(res);
    } catch(e: any) {
        handleException(e, res);
    }
}