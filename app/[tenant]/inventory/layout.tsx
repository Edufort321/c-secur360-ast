// CSS du module Inventaire — assaini (sans @tailwind, base scopée sous .inventory-app).
import '@/components/inventory/styles/globals.css';

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
