import Fastify from "fastify";
import { itemsRoutes } from "./modules/items/items.routes";

import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import { itemsWs } from "./modules/items/items.ws";



const app = Fastify({ logger: true });
app.register(cors, {
  origin: "*",
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS", "PUT"],
});

app.register(websocket);
app.register(itemsWs);

app.register(itemsRoutes);

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Server is running on port ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();