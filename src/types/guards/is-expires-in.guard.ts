import type { ExpiresInValueType } from "../environment/jwt-env.interface.js";


export function isExpiresInValue(value: string): value is ExpiresInValueType {
    const possibleValues = [
        "1d",
        "1h"
    ]
    return possibleValues.includes(value);
}