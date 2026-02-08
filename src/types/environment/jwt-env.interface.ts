export type ExpiresInValueType = "1d" | "1h";

export interface IJWTEnv {
    expiresIn: ExpiresInValueType;
    secret: string;
}