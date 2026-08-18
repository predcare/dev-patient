import React from 'react';
import { DropdownPickerModal } from '../MemberManagement';

export interface CitySelectModalProps {
  visible: boolean;
  cities: string[];
  selectedCity: string | null;
  onSelect: (city: string) => void;
  onClose: () => void;
}

export const CitySelectModal: React.FC<CitySelectModalProps> = ({
  visible,
  cities,
  selectedCity,
  onSelect,
  onClose,
}) => {
  const options = cities.map(c => ({ label: c, value: c }));

  return (
    <DropdownPickerModal
      visible={visible}
      title="Select City"
      options={options}
      selectedValue={selectedCity || ''}
      onSelect={onSelect}
      onClose={onClose}
    />
  );
};

export default CitySelectModal;
