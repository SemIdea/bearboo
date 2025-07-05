import { config } from "dotenv";
import path from "node:path";

config({
  path: path.resolve(__dirname, "../../.env")
});

function GetBoolEnv(val: string, defaultValue?: boolean): boolean {
  const env = process.env[val];
  if (!env) return defaultValue || false;
  return !(env === "false");
}

function GetIntEnv(val: string): number | undefined;
function GetIntEnv(val: string, defaultValue: number): number;
function GetIntEnv(val: string, defaultValue?: number): number | undefined {
  const env = process.env[val];
  if (!env || isNaN(Number(env))) return defaultValue || undefined;
  return Number(env);
}

function GetStrEnv(val: string): string | undefined;
function GetStrEnv(val: string, defaultValue: string): string;
function GetStrEnv(val: string, defaultValue?: string): string | undefined {
  const env = process.env[val];
  if (!env) return defaultValue || undefined;
  return env;
}

type EnumsA = string;

function GetEnumEnv<T extends EnumsA>(
  val: string,
  enums: Array<T>
): T | undefined;
function GetEnumEnv<T extends EnumsA>(
  val: string,
  defaultValue: T,
  enums: Array<T>
): T;
function GetEnumEnv<T extends EnumsA>(
  val: string,
  defaultValueOrEnum: T | Array<T>,
  enums?: Array<T>
): T | undefined {
  const env = process.env[val] as T | undefined;
  const en = enums || defaultValueOrEnum;
  const df = enums && (defaultValueOrEnum as T);
  if (!env) return df || undefined;
  if (!en.includes(env)) return df || undefined;
  return env;
}

export { GetBoolEnv, GetIntEnv, GetStrEnv, GetEnumEnv };
 