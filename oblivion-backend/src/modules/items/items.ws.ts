import { FastifyInstance, FastifyRequest } from "fastify";
import { WebSocket } from "ws"; // Import the standard WebSocket type
import {
    registerClient,
    unregisterClient
} from "../../shared/ws";

export async function itemsWs(app: FastifyInstance) {
    app.get("/ws", { websocket: true }, (socket: WebSocket, req: FastifyRequest) => {
        req.log.info("WebSocket client connected");
        registerClient(socket);

        socket.on("close", () => {
            req.log.info("WebSocket client disconnected");
            unregisterClient(socket);
        });

        socket.on("error", (err) => {
            req.log.error(err, "WebSocket error");
        });
    });
}