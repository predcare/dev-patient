import dayjs from 'dayjs';
import { IMyProfileDoc } from '../../typescripts/interfaces/profile.interfaces';

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
