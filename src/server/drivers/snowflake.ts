import { Snowflake, decodeSnowflake } from "@skorotkiewicz/snowflake-id";
const GenerateSnowflakeUID = async (machineId: number = 1): Promise<string> => {
  const snowflake = new Snowflake(machineId);
  const id = await snowflake.generate();

  return id;
};

const GetTimestampFromID = (
  id: string
): {
  timestamp: string;
  machineId: string;
  sequence: string;
} => {
  return decodeSnowflake(id);
};

export { GenerateSnowflakeUID, GetTimestampFromID };
