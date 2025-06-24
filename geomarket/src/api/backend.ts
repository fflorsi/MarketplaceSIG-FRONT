const API_URL = 'http://localhost:5000';

// LOGIN
export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

// REGISTER
export async function register(data: {
  email: string;
  password: string;
  name: string;
  type: string;
  address?: string;
  radius?: number;
}) {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Register failed');
  return res.json();
}

// GET PROFILE
export async function getProfile(user_id: number) {
  const res = await fetch(`${API_URL}/profile?user_id=${user_id}`);
  if (!res.ok) throw new Error('Profile not found');
  return res.json();
}

// UPDATE USER
export async function updateUser(user_id: number, data: any) {
  const res = await fetch(`${API_URL}/users/${user_id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    // Get more detailed error information
    const errorText = await res.text();
    let errorMessage;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error || 'Update failed';
    } catch (e) {
      console.error('Error parsing error response:', e);
      errorMessage = errorText || 'Update failed';
    }
    throw new Error(errorMessage);
  }
  return res.json();
}

// CREATE SHOP
export async function createShop(data: { name: string; address: string; user_id: number }) {
  const res = await fetch(`${API_URL}/shops`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Create shop failed');
  return res.json();
}

// LIST SHOPS (opcionalmente con lat/lng/radius)
export async function listShops(params?: { lat?: number; lng?: number; radius?: number }) {
  const url = new URL(`${API_URL}/shops`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.append(key, String(value));
    });
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('List shops failed');
  return res.json();
}

// GET SHOP BY ID
export async function getShop(shop_id: number) {
  const res = await fetch(`${API_URL}/shops/${shop_id}`);
  if (!res.ok) throw new Error('Shop not found');
  return res.json();
}

// UPDATE SHOP
export async function updateShop(shop_id: number, data: any) {
  const res = await fetch(`${API_URL}/shops/${shop_id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Update shop failed');
  return res.json();
}

// DELETE SHOP
export async function deleteShop(shop_id: number) {
  const res = await fetch(`${API_URL}/shops/${shop_id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Delete shop failed');
  return res.json();
}

// CREATE PRODUCT
export async function createProduct(data: { name: string; price: number; has_discount?: boolean; shop_id: number }) {
  const res = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Create product failed');
  return res.json();
}

// LIST PRODUCTS BY SHOP
export async function listProductsByShop(shop_id: number) {
  const res = await fetch(`${API_URL}/shops/${shop_id}/products`);
  if (!res.ok) throw new Error('List products failed');
  return res.json();
}

// GET PRODUCT BY ID
export async function getProduct(product_id: number) {
  const res = await fetch(`${API_URL}/products/${product_id}`);
  if (!res.ok) throw new Error('Product not found');
  return res.json();
}

// UPDATE PRODUCT
export async function updateProduct(product_id: number, data: any) {
  const res = await fetch(`${API_URL}/products/${product_id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Update product failed');
  return res.json();
}

// DELETE PRODUCT
export async function deleteProduct(product_id: number) {
  const res = await fetch(`${API_URL}/products/${product_id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Delete product failed');
  return res.json();
}

// SEND OFFERS
export async function sendOffers() {
  const res = await fetch(`${API_URL}/send_offers`);
  if (!res.ok) throw new Error('Send offers failed');
  return res.json();
}

export async function listUsers() {
  const res = await fetch(`${API_URL}/users`);
  if (!res.ok) throw new Error('List users failed');
  return res.json();
}