import { useEffect, useState, useRef } from "react";
import { fetchItems, createItem, updateItem, type Item } from "../api/items";

// Derive WebSocket URL from API base URL
const getWebSocketUrl = () => {
  const apiBase = "https://oblivion-1-kaax.onrender.com";
  // Convert https:// to wss:// and http:// to ws://
  return apiBase.replace(/^https?/, (match) => match === "https" ? "wss" : "ws") + "/ws";
};

export function ItemsPage() {
  // --- 1. STATE ---
  const [items, setItems] = useState<Item[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  // --- 2. EFFECT ---
  useEffect(() => {
    fetchItems()
      .then((data) => setItems(data))
      .catch((err) => console.error("Failed to load items:", err));
  }, []);

  // WebSocket connection with reconnection logic
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const ws = new WebSocket(getWebSocketUrl());
        wsRef.current = ws;

        ws.onopen = () => {
          console.log("WebSocket connected");
          // Clear any pending reconnection
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
          }
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);

            if (message.type === "ITEM_CREATED") {
              setItems((prev) => {
                if (prev.some((item) => item.id === message.payload.id)) {
                  return prev;
                }
                return [message.payload, ...prev];
              });
            }

            if (message.type === "ITEM_UPDATED") {
              setItems((prev) =>
                prev.map((i) =>
                  (i.id === message.payload.id ? message.payload : i)
                )
              );
            }
          } catch (err) {
            console.error("Failed to parse WebSocket message:", err);
          }
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
        };

        ws.onclose = () => {
          console.log("WebSocket disconnected, attempting to reconnect...");
          // Reconnect after 3 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, 3000);
        };
      } catch (error) {
        console.error("Failed to create WebSocket:", error);
      }
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  // --- 3. HANDLERS ---
  async function handleSave() {
    if (!title || !content) return;

    try {
      if (editingId) {
        // UPDATE existing item
        const updated = await updateItem(editingId, { title, content });
        setItems((prev) => prev.map((item) => (item.id === editingId ? updated : item)));
        setEditingId(null);
      } else {
        // CREATE new item
        const newItem = await createItem({ title, content });
        setItems((prev) => {
          if (prev.some((item) => item.id === newItem.id)) {
            return prev;
          }
          return [newItem, ...prev];
        });
      }

      // Reset form
      setTitle("");
      setContent("");
    } catch (error) {
      alert("Failed to save item");
      console.error(error);
    }
  }

  function handleEdit(item: Item) {
    setEditingId(item.id);
    setTitle(item.title);
    setContent(item.content);
  }

  function handleCancel() {
    setEditingId(null);
    setTitle("");
    setContent("");
  }

  // --- 4. JSX ---
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "2rem", textAlign: "center", background: "linear-gradient(to right, #3b82f6, #6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        Oblivion Web Client
      </h1>

      {/* Input Section */}
      <div className="glass-panel input-group">
        <div className="flex-between" style={{ marginBottom: "1rem" }}>
          <h3>{editingId ? "Edit Note" : "New Note"}</h3>
          {editingId && (
            <button onClick={handleCancel} className="btn-secondary" style={{ fontSize: "0.875rem" }}>
              Cancel Edit
            </button>
          )}
        </div>

        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: "0.75rem" }}
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          style={{ padding: "0.75rem", resize: "vertical" }}
        />
        <button
          onClick={handleSave}
          className="btn-primary"
          style={{ marginTop: "0.5rem" }}
        >
          {editingId ? "Update Item" : "Save Item"}
        </button>
      </div>

      {/* List Section */}
      <div style={{ marginTop: "3rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        {items.map((item) => (
          <div key={item.id} className="card">
            <div className="flex-between">
              <small className="text-muted">ID: {item.id}</small>
              <button
                onClick={() => handleEdit(item)}
                className="btn-secondary"
                style={{ padding: "0.25rem 0.75rem", fontSize: "0.8rem" }}
              >
                Edit
              </button>
            </div>
            <h3 style={{ margin: "0.5rem 0", fontSize: "1.25rem" }}>{item.title}</h3>
            <p style={{ lineHeight: "1.6", color: "var(--text-secondary)" }}>{item.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}