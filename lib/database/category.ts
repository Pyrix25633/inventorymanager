import { Category } from "@prisma/client";
import { settings } from "../settings";
import { Order } from "../validation/semantic-validation";
import { NotFound, UnprocessableContent } from "../web/response";
import { prisma } from "./prisma";

export async function isCategoryNameInUse(userId: number, name: string): Promise<boolean> {
    return (await prisma.category.count({
        where: {
            userId: userId,
            name: name
        }
    })) != 0;
}

export async function createCategory(userId: number, name: string, defaultLocationId: number): Promise<Category> {
    try {
        return await prisma.category.create({
            data: {
                userId: userId,
                name: name,
                defaultLocationId: defaultLocationId
            }
        });
    } catch(e: any) {
        throw new UnprocessableContent();
    }
}

export async function findCategories(userId: number, page: number | undefined, order: Order | undefined): Promise<{ name: string; defaultLocation: { name: string; } }[]> {
    return prisma.category.findMany({
        select: {
            id: true,
            name: true,
            defaultLocation: {
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

export async function countCategoriesPages(): Promise<number> {
    return Math.ceil(await prisma.category.count() / settings.database.pageSize);
}

export async function findCategory(id: number): Promise<Category> {
    const category: Category | null = await prisma.category.findUnique({
        where: {
            id: id
        }
    });
    if(category == null)
        throw new NotFound();
    return category;
}

export async function updateCategory(id: number, name: string, defaultLocationId: number): Promise<Category> {
    try {
        return await prisma.category.update({
            data: {
                name: name,
                defaultLocationId: defaultLocationId
            },
            where: {
                id: id
            }
        });
    } catch(e: any) {
        throw new UnprocessableContent();
    }
}