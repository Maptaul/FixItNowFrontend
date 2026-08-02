/**
 * Hosts `next/image` is allowed to load from.
 *
 * This list is the single source for both `next.config.ts` and the avatar URL
 * check in `lib/validations.ts`. Keeping them apart would let validation
 * accept a host the image loader then rejects with a 400 — the user would see
 * a broken picture instead of a field error telling them what to fix.
 *
 * No imports here on purpose: `next.config.ts` is loaded before path aliases
 * resolve, so this file has to stand entirely on its own.
 */
export const IMAGE_HOSTS = [
  // Generated avatars for technicians and customers.
  "api.dicebear.com",
  // Free-to-use photography for service/category imagery.
  "images.unsplash.com",
  // Where users are told to upload their profile picture.
  "i.ibb.co",
  "i.ibb.co.com",
] as const;

/** `https://i.ibb.co/abc/x.png` → true. Anything else → false. */
export const isAllowedImageHost = (value: string): boolean => {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (IMAGE_HOSTS as readonly string[]).includes(url.hostname)
    );
  } catch {
    return false;
  }
};
