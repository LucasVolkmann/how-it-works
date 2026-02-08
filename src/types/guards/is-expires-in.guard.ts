import type { ExpiresInValueType } from "../environment/jwt-env.interface.js";


export function isExpiresInValue(value: string): value is ExpiresInValueType {
    const possibleValues = [
        "1d",
        "1h",
        "15min"
    ]
    return possibleValues.includes(value);
}