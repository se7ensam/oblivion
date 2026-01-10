import { WebSocket } from "ws";

const clients = new Set<WebSocket>();

export function registerClient(client: WebSocket) {
    clients.add(client);
}

export function unregisterClient(client: WebSocket) {
    clients.delete(client);
}

export function broadcast(message: unknown) {
    const data = JSON.stringify(message);

    for (const client of clients) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    }
}
