

import axios from "axios";

// This must match your Backend URL
const API_BASE = "http://localhost:3000";

// This must match the shape of data your Backend sends
export type Item = {
  id: string;
  title: string;
  content: string;
  createdAt?: string; // Optional because simpler backends might skip it
};

// Function to GET all items
export async function fetchItems(): Promise<Item[]> {
  const res = await axios.get(`${API_BASE}/items`);
  return res.data;
}

// Function to CREATE an item
export async function createItem(data: { title: string; content: string }) {
  const res = await axios.post(`${API_BASE}/items`, data);
  return res.data;
}

// Function to UPDATE an item (we'll fix the backend route for this later if needed)
export async function updateItem(id: string, data: { title?: string; content?: string }) {
  const res = await axios.patch(`${API_BASE}/items/${id}`, data);
  return res.data;
}