import { useCallback } from 'react';
import { Audio, getFileSize, Image, Video } from 'react-native-compressor';
import { MAX_COMPRESS_FILE_BYTES } from '../../config/constants';
import { showErrorToast } from '../../lib/common/toast.utils';
import { useLoadingStore } from '../../zustand/stores/useLoadingStore';

export type CompressibleFile = {
  uri: string;
  name: string;
  type: string;
  size?: number | string;
};

export type CompressFileOptions = {
  maxBytes?: number;
};

type MediaKind = 'image' | 'video' | 'audio' | 'other';

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'heic', 'heif', 'webp'];
const VIDEO_EXTENSIONS = ['mp4', 'mov', 'm4v', 'avi', 'mkv', 'webm'];
const AUDIO_EXTENSIONS = ['mp3', 'wav', 'm4a', 'aac', 'ogg'];

const IMAGE_STEPS = [
  { quality: 0.8, edge: 2048 },
  { quality: 0.65, edge: 1600 },
  { quality: 0.5, edge: 1280 },
  { quality: 0.4, edge: 1280 },
];

const VIDEO_STEPS = [
  { bitrate: 2_000_000, maxSize: 1280 },
  { bitrate: 1_000_000, maxSize: 960 },
  { bitrate: 500_000, maxSize: 640 },
];

const AUDIO_STEPS: Array<{ quality: 'high' | 'medium' | 'low'; bitrate?: number }> = [
  { quality: 'high' },
  { quality: 'medium' },
  { quality: 'low' },
  { quality: 'low', bitrate: 64000 },
];

const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  m4v: 'video/x-m4v',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  m4a: 'audio/mp4',
  aac: 'audio/aac',
};

const toBytes = (size?: number | string): number | undefined => {
  if (typeof size === 'number' && Number.isFinite(size) && size > 0) {
    return size;
  }
  if (typeof size === 'string' && size.trim() !== '') {
    const parsed = Number(size);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return undefined;
};

const extensionOf = (value: string) => {
  const clean = value.split('?')[0].split('#')[0];
  const match = clean.match(/\.([a-zA-Z0-9]+)$/);
  return match?.[1]?.toLowerCase();
};

const replaceExtension = (name: string, extension: string) => {
  const base = name.replace(/\.[^.]+$/, '');
  return `${base || 'file'}.${extension}`;
};

const getKind = (file: CompressibleFile): MediaKind => {
  const type = file.type.toLowerCase();
  const extension = extensionOf(file.name) || extensionOf(file.uri);

  if (type.startsWith('image/') || (extension && IMAGE_EXTENSIONS.includes(extension))) {
    return 'image';
  }
  if (type.startsWith('video/') || (extension && VIDEO_EXTENSIONS.includes(extension))) {
    return 'video';
  }
  if (type.startsWith('audio/') || (extension && AUDIO_EXTENSIONS.includes(extension))) {
    return 'audio';
  }
  return 'other';
};

const measureFile = async (uri: string) => {
  const measured = Number(await getFileSize(uri));
  return Number.isFinite(measured) && measured > 0 ? measured : undefined;
};

const tooLargeMessage = (maxBytes: number) => {
  const limitMb = Math.max(1, Math.round(maxBytes / (1024 * 1024)));
  return `This file is still larger than ${limitMb}MB. Please choose a smaller file.`;
};

const fileFromUri = (
  file: CompressibleFile,
  uri: string,
  size: number,
  fallbackExtension: string
) => {
  const extension = extensionOf(uri) || fallbackExtension;
  return {
    uri,
    name: replaceExtension(file.name, extension),
    type: MIME_BY_EXTENSION[extension] || file.type,
    size,
  };
};

const compressImage = async (file: CompressibleFile, maxBytes: number) => {
  for (const step of IMAGE_STEPS) {
    const uri = await Image.compress(file.uri, {
      compressionMethod: 'manual',
      output: 'jpg',
      quality: step.quality,
      maxWidth: step.edge,
      maxHeight: step.edge,
    });
    const size = await measureFile(uri);
    if (size != null && size <= maxBytes) {
      return fileFromUri(file, uri, size, 'jpg');
    }
  }
  return null;
};

const compressVideo = async (file: CompressibleFile, maxBytes: number) => {
  for (const step of VIDEO_STEPS) {
    const uri = await Video.compress(file.uri, {
      compressionMethod: 'manual',
      bitrate: step.bitrate,
      maxSize: step.maxSize,
    });
    const size = await measureFile(uri);
    if (size != null && size <= maxBytes) {
      return fileFromUri(file, uri, size, 'mp4');
    }
  }
  return null;
};

const compressAudio = async (file: CompressibleFile, maxBytes: number) => {
  for (const step of AUDIO_STEPS) {
    const uri = await Audio.compress(file.uri, {
      quality: step.quality,
      bitrate: step.bitrate,
    });
    const size = await measureFile(uri);
    if (size != null && size <= maxBytes) {
      return fileFromUri(file, uri, size, extensionOf(file.name) || 'm4a');
    }
  }
  return null;
};

export const useCompressFile = () => {
  const compressFile = useCallback(
    async (
      file: CompressibleFile,
      options?: CompressFileOptions
    ): Promise<CompressibleFile | null> => {
      const maxBytes = options?.maxBytes ?? MAX_COMPRESS_FILE_BYTES;
      const kind = getKind(file);

      const knownSize = toBytes(file.size);
      if (knownSize != null && knownSize <= maxBytes) {
        return file;
      }

      const { showLoader, hideLoader } = useLoadingStore.getState();
      const rejectTooLarge = () => {
        hideLoader();
        showErrorToast(tooLargeMessage(maxBytes), 'File too large');
        return null;
      };

      if (kind === 'other') {
        const currentSize = knownSize ?? (await measureFile(file.uri));
        if (currentSize != null && currentSize > maxBytes) {
          return rejectTooLarge();
        }
        return currentSize != null ? { ...file, size: currentSize } : file;
      }

      showLoader('Compressing your file...');
      try {
        const currentSize = knownSize ?? (await measureFile(file.uri));
        if (currentSize != null && currentSize <= maxBytes) {
          return { ...file, size: currentSize };
        }

        const compressed =
          kind === 'image'
            ? await compressImage(file, maxBytes)
            : kind === 'video'
            ? await compressVideo(file, maxBytes)
            : await compressAudio(file, maxBytes);
        const compressedSize = toBytes(compressed?.size);

        if (!compressed || compressedSize == null || compressedSize > maxBytes) {
          return rejectTooLarge();
        }

        return compressed;
      } catch {
        return rejectTooLarge();
      } finally {
        hideLoader();
      }
    },
    []
  );

  return { compressFile };
};

export default useCompressFile;
