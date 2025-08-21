// utils/photoInbox.ts
let pending: string[] = [];

export const PhotoInbox = {
  push(uri: string) {
    pending.push(uri);
  },
  consumeAll(): string[] {
    const out = pending.slice();
    pending = [];
    return out;
  },
};