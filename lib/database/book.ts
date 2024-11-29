import { Book } from "@prisma/client";
import { settings } from "../settings";
import { Order } from "../validation/semantic-validation";
import { NotFound, UnprocessableContent } from "../web/response";
import { prisma } from "./prisma";

export async function createBook(userId: number, categoryId: number, title: string, locationId: number): Promise<Book> {
    try {
        return await prisma.book.create({
            data: {
                userId: userId,
                categoryId: categoryId,
                title: title,
                locationId: locationId
            }
        });
    } catch(e: any) {
        throw new UnprocessableContent();
    }
}

export async function findBooks(userId: number, page: number | undefined, order: Order | undefined): Promise<{ category: { name: string; }; title: string; location: { name: string; } }[]> {
    return prisma.book.findMany({
        select: {
            id: true,
            category: {
                select: {
                    name: true
                }
            },
            title: true,
            location: {
                select: {
                    name: true
                }
            }
        },
        where: {
            userId: userId
        },
        orderBy: order,
        skip: page != undefined ? page * settings.database.pageSize : undefined,
        take: page != undefined ? settings.database.pageSize : undefined
    });
}

export async function countBookPages(): Promise<number> {
    return Math.ceil(await prisma.book.count() / settings.database.pageSize);
}

export async function findBook(id: number): Promise<Book> {
    const category: Book | null = await prisma.book.findUnique({
        where: {
            id: id
        }
    });
    if(category == null)
        throw new NotFound();
    return category;
}

export async function updateBook(id: number, categoryId: number, title: string, locationId: number): Promise<Book> {
    try {
        return await prisma.book.update({
            data: {
                categoryId: categoryId,
                title: title,
                locationId: locationId
            },
            where: {
                id: id
            }
        });
    } catch(e: any) {
        throw new UnprocessableContent();
    }
}

export async function deleteBook(id: number): Promise<Book> {
    return prisma.book.delete({
        where: {
            id: id
        }
    });
}