import { Snowflake, decodeSnowflake } from "@skorotkiewicz/snowflake-id";
const snowflakeInstance = new Snowflake(1);

const GenerateSnowflakeUID = async (): Promise<string> => {
  const id = await snowflakeInstance.generate();

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
