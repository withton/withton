// Converts a type T to a structure excluding its methods (only includes properties)
export type ToPlainObject<T> = {
  [P in keyof T as T[P] extends Function ? never : P]: T[P];
};

// Removes the 'id' property from a type T, assuming it has an 'id'
export type RemoveId<T extends { id: unknown }> = Omit<T, "id">;

// Removes the 'id' property distributively from unions of T, assuming it has an 'id'
export type DistributiveRemoveId<T extends { id: unknown }> =
  OmitFromDistributive<T, "id">;

// Distributive Omit helper that works across unions
export type OmitFromDistributive<T, K extends keyof T> = T extends unknown
  ? Omit<T, K>
  : never;

// Makes properties K of T optional while keeping the rest unchanged
export type MakeOptional<T, K extends keyof T> = Pick<Partial<T>, K> &
  Omit<T, K>;

// Checks if a value has a specific property (runtime type guard)
export function hasKey<T extends string>(
  value: unknown,
  key: T,
): value is Record<T, unknown> {
  return hasKeys(value, [key]);
}

// Checks if a value has all specified properties (runtime type guard)
export function hasKeys<T extends string>(
  value: unknown,
  keys: T[],
): value is Record<T, unknown> {
  if (!value || typeof value !== "object") {
    return false;
  }

  return keys.every((key) => key in value);
}
