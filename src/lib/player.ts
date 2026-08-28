const KEY = "vault.playerId";
const WALLET_KEY = "vault.wallet";

function randomHex(len: number) {
  const hex = "0123456789abcdef";
  let out = "";
  for (let i = 0; i < len; i++) out += hex[Math.floor(Math.random() * 16)];
  return out;
}

export function getPlayerId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = randomHex(24);
    localStorage.setItem(KEY, id);
  }
  return id;
}

/** MVP demo wallet: gas is sponsored by the relayer, so no real signing is needed. */
export function getWallet(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(WALLET_KEY);
}

export function connectWallet(): string {
  const address = `0x${randomHex(40)}`;
  localStorage.setItem(WALLET_KEY, address);
  return address;
}

export function disconnectWallet() {
  localStorage.removeItem(WALLET_KEY);
}

export function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
