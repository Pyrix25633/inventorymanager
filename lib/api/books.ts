import { Request, Response } from "express";
import { countBookPages, createBook, deleteBook, findBook, findBooks, updateBook } from "../database/book";
import { findCategory } from "../database/category";
import { findLocation } from "../database/location";
import { getOrder, getTitle } from "../validation/semantic-validation";
import { getInt, getObject, getOrUndefined } from "../validation/type-validation";
import { Created, Forbidden, handleException, NoContent, Ok, UnprocessableContent } from "../web/response";
import { validateToken } from "./auth";

export async function getBooks(req: Request, res: Response): Promise<void> {
    try {
        const user = await validateToken(req);
        const page = getOrUndefined(req.query.page, getInt);
        const order = getOrUndefined(req.query.order, getOrder);
        const books = await findBooks(user.id, page, order);
        const pages = await countBookPages();
        new Ok({ books: books, pages: pages }).send(res);
    } catch(e: any) {
        handleException(e, res);
    }
}

export async function postBook(req: Request, res: Response): Promise<void> {
    try {
        const user = await validateToken(req);
        const body = getObject(req.body);
        const categoryId = getInt(body.categoryId);
        const category = await findCategory(categoryId);
        if(category.userId != user.id)
            throw new UnprocessableContent();
        const title = getTitle(body.title);
        const locationId = getInt(body.locationId);
        const location = await findLocation(locationId);
        if(location.userId != user.id)
            throw new UnprocessableContent();
        const book = await createBook(user.id, categoryId, title, locationId);
        new Created({ id: book.id }).send(res);
    } catch(e: any) {
        handleException(e, res);
    }
}

export async function getBook(req: Request, res: Response): Promise<void> {
    try {
        const user = await validateToken(req);
        const id = getInt(req.params.bookId);
        const book = await findBook(id);
        if(book.userId != user.id)
            throw new Forbidden();
        new Ok({ categoryId: book.categoryId, title: book.title, locationId: book.locationId }).send(res);
    } catch(e: any) {
        handleException(e, res);
    }
}

export async function patchBook(req: Request, res: Response): Promise<void> {
    try {
        const user = await validateToken(req);
        const id = getInt(req.params.bookId);
        const body = getObject(req.body);
        const categoryId = getInt(body.categoryId);
        const category = await findCategory(categoryId);
        if(category.userId != user.id)
            throw new UnprocessableContent();
        const title = getTitle(body.title);
        const locationId = getInt(body.locationId);
        const location = await findLocation(locationId);
        if(location.userId != user.id)
            throw new UnprocessableContent();
        const book = await findBook(id);
        if(book.userId != user.id)
            throw new Forbidden();
        await updateBook(id, categoryId, title, locationId);
        new NoContent().send(res);
    } catch(e: any) {
        handleException(e, res);
    }
}

export async function delBook(req: Request, res: Response): Promise<void> {
    try {
        const user = await validateToken(req);
        const id = getInt(req.params.bookId);
        const book = await findBook(id);
        if(book.userId != user.id)
            throw new Forbidden();
        await deleteBook(id);
        new NoContent().send(res);
    } catch(e: any) {
        handleException(e, res);
    }
}