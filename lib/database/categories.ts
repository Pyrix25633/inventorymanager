import { Category } from "@prisma/client";
import { Order } from "../validation/semantic-validation";
import { NotFound } from "../web/response";
import { prisma } from "./prisma";

export async function findCategories(userId: number, page: number | undefined, order: Order | undefined): Promise<{ name: string; defaultLocation: { name: string; } }[]> {
    return prisma.category.findMany({
        select: {
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
        skip: page != undefined ? page * 10 : undefined,
        take: page != undefined ? 10 : undefined
    });
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