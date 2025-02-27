import { Snowflake, decodeSnowflake } from "@skorotkiewicz/snowflake-id";

async function GenerateSnowflakeUID(machineId: number = 1): Promise<string> {
  const snowflake = new Snowflake(machineId);
  const id = await snowflake.generate();

  return id;
}

function GetTimestampFromID(id: string): {
  timestamp: string;
  machineId: string;
  sequence: string;
} {
  return decodeSnowflake(id);
}

export { GenerateSnowflakeUID, GetTimestampFromID };
