import dayjs from 'dayjs';
import { Linking, Platform } from 'react-native';
import { ICommisionSlabsDoc } from '../../typescripts/interfaces/common.interfaces';
import { IMyProfileDoc } from '../../typescripts/interfaces/profile.interfaces';
import { showErrorToast } from './toast.utils';

export const formatDate = (
  date: Date | string | null | undefined,
  format = 'DD/MM/YYYY'
): string => {
  if (!date) return '';
  return dayjs(date).format(format);
};

export const dateOnly = (dateTimeStr: string, format = 'DD MMM YYYY'): string => {
  if (!dateTimeStr?.includes('T')) return '';
  const datePart = dateTimeStr.split('T')[0];
  return dayjs(datePart).format(format);
};

export function getInitials(name: string): string {
  if (!name) return 'D';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0][0].toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const getAvatarColor = (name = '', colors: string[] = ['#00897B', '#00796B']): string => {
  const hash = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export const formatTimeAgo = (date: string): string => {
  const d = dayjs(date);
  const minutes = dayjs().diff(d, 'minute');

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = dayjs().diff(d, 'hour');
  if (hours < 24) return d.format('hh:mm A');

  const days = dayjs().diff(d, 'day');
  if (days < 7) return `${days}d ago`;

  return d.format('MMM D');
};

export const getAge = (dob: string): string => {
  if (!dob) return '';
  const b = new Date(dob);
  const t = new Date();
  let age = t.getFullYear() - b.getFullYear();
  const m = t.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) age--;
  return age > 0 ? `${age}y` : '< 1y';
};

export const getProfileCompletion = (profile: IMyProfileDoc | null) => {
  if (!profile) return { isCompleted: false, percentage: 0 };
  const { date_of_birth, address, country, state, city, postal_code, gender, email, phone_number } =
    profile;

  const fields = [
    date_of_birth,
    address,
    country,
    state,
    city,
    postal_code,
    gender,
    email,
    phone_number,
  ];
  const percentage = Math.round((fields.filter(Boolean).length / fields.length) * 100);

  return {
    isCompleted: percentage === 100,
    percentage,
  };
};

export const getDuration = (startTime: string, endTime: string): string => {
  const toMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  let duration = toMinutes(endTime) - toMinutes(startTime);
  if (duration < 0) duration += 1440;

  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  return hours ? `${hours}h ${minutes}m` : `${minutes} minutes`;
};

export const _formatTime = (time: string): string => dayjs(`2000-01-01 ${time}`).format('hh:mm A');

export const openLocationOnMap = (params: {
  address?: string;
  lat?: number | string | null;
  long?: number | string | null;
}): void => {
  const { address, lat, long } = params || {};

  const latitude = lat ?? null;
  const longitude = long ?? null;
  const clinicAddress = address?.trim() || '';

  // Validate location data
  const hasCoordinates =
    latitude !== null &&
    latitude !== undefined &&
    latitude !== '' &&
    longitude !== null &&
    longitude !== undefined &&
    longitude !== '';

  const hasAddress = Boolean(clinicAddress);

  if (!hasCoordinates && !hasAddress) {
    showErrorToast('Clinic location is not available');
    return;
  }
  let url = '';
  if (hasCoordinates) {
    url =
      Platform.OS === 'ios'
        ? `maps:0,0?q=${latitude},${longitude}`
        : `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  } else if (hasAddress) {
    url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinicAddress)}`;
  }

  Linking.openURL(url).catch(err => {
    console.error('Failed to open map URL:', err);
    showErrorToast('Unable to open map');
  });
};

export const calculatePlatformFee = (
  consultationFee: number,
  slabs?: ICommisionSlabsDoc[],
  doctorId?: number | string
): number => {
  if (!slabs || !slabs.length || consultationFee <= 0) return 0;

  const activeSlabs = slabs.filter(s => s.status);

  // Check for doctor-specific slabs first
  const docSlabs = activeSlabs.filter(
    s =>
      s.doctor_id !== null && s.doctor_id !== undefined && String(s.doctor_id) === String(doctorId)
  );

  const applicableSlabs = docSlabs.length > 0 ? docSlabs : activeSlabs.filter(s => !s.doctor_id);

  // Find matching range
  const matchedSlab = applicableSlabs.find(slab => {
    const min = parseFloat(slab.min_amount || '0');
    const max =
      slab.max_amount !== null && slab.max_amount !== undefined && slab.max_amount !== ''
        ? parseFloat(slab.max_amount)
        : Infinity;
    return consultationFee >= min && consultationFee <= max;
  });

  if (!matchedSlab) return 0;

  const feeVal = parseFloat(matchedSlab.fee_value || '0');
  if (matchedSlab.fee_type === 'percentage') {
    return Math.round(((consultationFee * feeVal) / 100) * 100) / 100;
  }
  return feeVal;
};
