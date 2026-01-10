import { FastifyInstance } from "fastify";
import {
    registerClient,
    unregisterClient
} from "../../shared/ws";

export async function itemsWs(app: FastifyInstance) {
    app.get("/ws", { websocket: true }, (socket, req) => {
        req.log.info("WebSocket client connected");
        registerClient(socket);

        socket.on("close", () => {
            req.log.info("WebSocket client disconnected");
            unregisterClient(socket);
        });
    });
}
