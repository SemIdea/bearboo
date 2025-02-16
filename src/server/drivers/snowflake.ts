import { Snowflake } from "nodejs-snowflake";

function GenerateSnowflakeUID(
  custom_epoch?: number,
  instance_id?: number
): string {
  const uid = new Snowflake({
    custom_epoch: custom_epoch,
    instance_id: instance_id,
  });

  return uid.getUniqueID().toString();
}

function GetIDFromTimestamp(
  timestamp: number,
  custom_epoch?: number,
  instance_id?: number
): string {
  const uid = new Snowflake({
    custom_epoch: custom_epoch,
    instance_id: instance_id,
  });

  return uid.idFromTimestamp(timestamp).toString();
}

function GetTimestampFromID(id: bigint, custom_epoch: number): number {
  return Snowflake.timestampFromID(id, custom_epoch);
}

function GetInstanceIDFromID(id: bigint): number {
  return Snowflake.instanceIDFromID(id);
}

function GetCurrentInstanceID(
  custom_epoch?: number,
  instance_id?: number
): number {
  const uid = new Snowflake({
    custom_epoch: custom_epoch,
    instance_id: instance_id,
  });

  return uid.instanceID();
}

export {
  GenerateSnowflakeUID,
  GetIDFromTimestamp,
  GetTimestampFromID,
  GetInstanceIDFromID,
  GetCurrentInstanceID,
};
