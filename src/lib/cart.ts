export interface CartItem {
  id_producto: number; nombre: string; precio: number;
  cantidad: number; imagen_url?: string; codigo_sku: string;
}
const KEY = "cs_cart";
const emit = (items: CartItem[]) =>
  typeof window !== "undefined" && window.dispatchEvent(new CustomEvent("cart-update", { detail: items }));

export const cart = {
  get:     (): CartItem[] => { try { return JSON.parse(localStorage.getItem(KEY)||"[]"); } catch { return []; } },
  count:   (): number     => cart.get().reduce((a,i) => a+i.cantidad, 0),
  total:   (): number     => cart.get().reduce((a,i) => a+i.precio*i.cantidad, 0),
  agregar: (item: Omit<CartItem,"cantidad"> & { cantidad?: number }) => {
    const items = cart.get(); const idx = items.findIndex(i => i.id_producto === item.id_producto);
    if (idx >= 0) items[idx].cantidad += item.cantidad ?? 1;
    else items.push({ ...item, cantidad: item.cantidad ?? 1 });
    localStorage.setItem(KEY, JSON.stringify(items)); emit(items); return items;
  },
  set:     (id: number, q: number) => {
    const items = cart.get(); const idx = items.findIndex(i => i.id_producto === id);
    if (idx >= 0) { if (q <= 0) items.splice(idx,1); else items[idx].cantidad = q; }
    localStorage.setItem(KEY, JSON.stringify(items)); emit(items); return items;
  },
  limpiar: () => { localStorage.removeItem(KEY); emit([]); },
};
