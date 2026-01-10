import { FastifyInstance } from "fastify";
import {
  createItemSchema,
  updateItemSchema
} from "./items.schema";
import {
  createItem,
  updateItem,
  listItems
} from "./items.service";

export async function itemsRoutes(app: FastifyInstance) {
  app.post("/items", async (req, res) => {
    // @ts-ignore: Fastify types for Zod are a bit tricky without extra setup, manual validation for now or trust middleware if we add it. 
    // Ideally we'd use fastify-type-provider-zod but let's stick to the prompt's request for manual parse or simple integration.
    // The prompt snippet used `createItemSchema.parse(req.body)`.
    const body = createItemSchema.parse(req.body);
    const item = await createItem(body);
    res.send(item);
  });

  app.patch("/items/:id", async (req, res) => {
    // @ts-ignore
    const body = updateItemSchema.parse(req.body);
    // @ts-ignore
    const item = await updateItem(req.params.id, body);
    res.send(item);
  });

  app.get("/items", async () => {
    return listItems();
  });
}