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

// (async () => {
//   const machineId = 1; // machine ID (0-1023)
//   const snowflake = new Snowflake(machineId);

//   const id1 = await snowflake.generate();
//   console.log("encodeID", id1);
//   // output: 7160521316708126720

//   const decoded = decodeSnowflake(id1);
//   console.log("decodeID", decoded);
//   // output: { timestamp: '2024-02-06T05:12:47.730Z', machineId: '1', sequence: '0' }
// })();

export { GenerateSnowflakeUID, GetTimestampFromID };
