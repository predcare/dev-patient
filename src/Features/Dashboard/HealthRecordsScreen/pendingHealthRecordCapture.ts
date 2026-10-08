export type PendingHealthRecordFile = {
  uri: string;
  name: string;
  type: string;
  size?: number | string;
};

let pendingFile: PendingHealthRecordFile | null = null;

/** Android only: survives Upload screen remount while the system camera is open. */
export const stashPendingHealthRecordFile = (file: PendingHealthRecordFile) => {
  pendingFile = file;
};

export const consumePendingHealthRecordFile = () => {
  const file = pendingFile;
  pendingFile = null;
  return file;
};

export const clearPendingHealthRecordFile = () => {
  pendingFile = null;
};
