import { db } from "../../db/pg";
import { items } from "../../db/pg/schema/items";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { broadcast } from "../../shared/ws";

export async function createItem(data: {
    title: string;
    content: string;
}) {
    const id = randomUUID();

    const [item] = await db
        .insert(items)
        .values({
            id,
            title: data.title,
            content: data.content
        })
        .returning();


    broadcast({ type: "ITEM_CREATED", payload: item });

    return item;
}

export async function updateItem(
    id: string,
    data: { title?: string; content?: string }
) {
    const [item] = await db
        .update(items)
        .set({
            ...data,
            updatedAt: new Date()
        })
        .where(eq(items.id, id))
        .returning();


    broadcast({ type: "ITEM_UPDATED", payload: item });

    return item;
}

export async function listItems() {
    return db.select().from(items).orderBy(items.createdAt);
}
