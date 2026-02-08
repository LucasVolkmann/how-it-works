export type ExpiresInValueType = "1d" | "1h" | "15min";

export interface IJWTEnv {
    expiresIn: ExpiresInValueType;
    secret: string;
}