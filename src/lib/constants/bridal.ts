/**
 * Authoritative Bridal Add-on & Enhancement Constants
 * The Jawed Habib Salon – Lalganj
 */

export interface BridalAddonItem {
  id: string;
  name: string;
  price: number;
  description: string;
  durationMinutes?: number;
  isPopular?: boolean;
}

export const BRIDAL_ADDONS: BridalAddonItem[] = [
  {
    id: "addon_hair_ext",
    name: "Hair Extensions & Padding Architecture",
    price: 1000,
    description: "Volume boost and durable pin-up structure for regal hairstyles",
    durationMinutes: 30,
    isPopular: true,
  },
  {
    id: "addon_family_glam",
    name: "Mother / Sister Family Party Makeup",
    price: 1500,
    description: "HD base and elegant hairstyle for 1 close family member",
    durationMinutes: 45,
    isPopular: false,
  },
  {
    id: "addon_draping_master",
    name: "Special Saree & Dupatta Pleating",
    price: 500,
    description: "Wrinkle-free ironed pleats with anti-slip magnetic pins",
    durationMinutes: 20,
    isPopular: true,
  },
];

export function getAddonById(id: string): BridalAddonItem | undefined {
  return BRIDAL_ADDONS.find((a) => a.id === id);
}

export function validateAddonIds(addonIds: string[]): { valid: boolean; invalidIds: string[]; addons: BridalAddonItem[] } {
  const invalidIds: string[] = [];
  const addons: BridalAddonItem[] = [];

  for (const id of addonIds) {
    const found = getAddonById(id);
    if (found) {
      addons.push(found);
    } else {
      invalidIds.push(id);
    }
  }

  return {
    valid: invalidIds.length === 0,
    invalidIds,
    addons,
  };
}
