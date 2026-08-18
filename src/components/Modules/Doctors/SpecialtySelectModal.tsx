import React from 'react';
import { DropdownPickerModal } from '../MemberManagement';

export interface SpecialtySelectModalProps {
  visible: boolean;
  specialties: string[];
  selectedSpecialty: string | null;
  onSelect: (specialty: string) => void;
  onClose: () => void;
}

export const SpecialtySelectModal: React.FC<SpecialtySelectModalProps> = ({
  visible,
  specialties,
  selectedSpecialty,
  onSelect,
  onClose,
}) => {
  const options = specialties.map(s => ({ label: s, value: s }));

  return (
    <DropdownPickerModal
      visible={visible}
      title="Select Specialty"
      options={options}
      selectedValue={selectedSpecialty || ''}
      onSelect={onSelect}
      onClose={onClose}
    />
  );
};

export default SpecialtySelectModal;
