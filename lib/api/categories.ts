import { Request, Response } from "express";
import { findCategories, findCategory } from "../database/categories";
import { getOrder } from "../validation/semantic-validation";
import { getInt, getOrUndefined } from "../validation/type-validation";
import { Forbidden, handleException, Ok } from "../web/response";
import { validateToken } from "./auth";

export async function getCategories(req: Request, res: Response): Promise<void> {
    try {
        const user = await validateToken(req);
        const page = getInt(req.query.page);
        const order = getOrUndefined(req.query.order, getOrder);
        const categories = await findCategories(user.id, page, order);
        new Ok({ categories: categories }).send(res);
    } catch(e: any) {
        handleException(e, res);
    }
}

export async function postCategory(req: Request, res: Response): Promise<void> {
    try {
        
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
        
    } catch(e: any) {
        handleException(e, res);
    }
}