import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import CommonErrorCard from '../../../../components/commons/CommonErrorCard/CommonErrorCard';
import { useCmnEmrCategories } from '../../../../hooks/react-query/common/common.hooks';
import { uploadRecordStyles } from '../../../../styled/UploadHealthRecordScreen.styled';
import { theme } from '../../../../styled/theme.styled';
import { ICommonEMRCats } from '../../../../typescripts/interfaces/common.interfaces';
import {
  BrainIcon,
  CheckBadgeIcon,
  ChevronRightIcon,
  DropletIcon,
  FileTextIcon,
  FolderIcon,
  HeartIcon,
  LabFlaskIcon,
  MicroscopeIcon,
  PillIcon,
  PrescriptionIcon,
  UltrasoundIcon,
  XRayIcon,
} from '../../../ui/icons';

export interface CategoryOption {
  id: string;
  name: string;
  iconBg: string;
  renderIcon: () => React.ReactNode;
}

export const getCategoryVisualConfig = (
  name: string = ''
): { iconBg: string; renderIcon: () => React.ReactNode } => {
  const norm = name.toLowerCase().replace(/[\s_]+/g, '-');

  if (norm.includes('lab') || norm.includes('pathology')) {
    return {
      iconBg: '#CCFBF1',
      renderIcon: () => <LabFlaskIcon size={22} color={theme.colors.primary} />,
    };
  }
  if (norm.includes('x-ray') || norm.includes('xray')) {
    return {
      iconBg: '#E0F2FE',
      renderIcon: () => <XRayIcon size={22} color={theme.colors.primary} />,
    };
  }
  if (norm.includes('mri')) {
    return {
      iconBg: '#FDF2F4',
      renderIcon: () => <BrainIcon size={22} color={theme.colors.primary} />,
    };
  }
  if (norm.includes('ct')) {
    return {
      iconBg: '#F0FDF4',
      renderIcon: () => <MicroscopeIcon size={22} color={theme.colors.primary} />,
    };
  }
  if (norm.includes('ultrasound')) {
    return {
      iconBg: '#FEFCE8',
      renderIcon: () => <UltrasoundIcon size={22} color={theme.colors.primary} />,
    };
  }
  if (norm.includes('ecg') || norm.includes('heart') || norm.includes('cardio')) {
    return {
      iconBg: '#FDF2F4',
      renderIcon: () => <HeartIcon size={22} color={theme.colors.primary} />,
    };
  }
  if (norm.includes('blood')) {
    return {
      iconBg: '#FDF2F4',
      renderIcon: () => <DropletIcon size={22} color={theme.colors.primary} />,
    };
  }
  if (norm.includes('prescription') || norm.includes('rx')) {
    return {
      iconBg: '#F0FDFA',
      renderIcon: () => <PrescriptionIcon size={22} color={theme.colors.primary} />,
    };
  }
  if (norm.includes('discharge') || norm.includes('summary')) {
    return {
      iconBg: '#EFF6FF',
      renderIcon: () => <FileTextIcon size={22} color={theme.colors.primary} />,
    };
  }
  if (norm.includes('certificate')) {
    return {
      iconBg: '#FEF3C7',
      renderIcon: () => <CheckBadgeIcon size={22} color={theme.colors.primary} />,
    };
  }
  if (norm.includes('vaccin') || norm.includes('immuniz')) {
    return {
      iconBg: '#F0FDF4',
      renderIcon: () => <PillIcon size={22} color={theme.colors.primary} />,
    };
  }
  return {
    iconBg: '#F1F5F9',
    renderIcon: () => <FolderIcon size={22} color={theme.colors.primary} />,
  };
};

export interface StepCategorySelectProps {
  selectedCategory: string;
  onSelectCategory: (category: CategoryOption) => void;
}

export const StepCategorySelect: React.FC<StepCategorySelectProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const {
    data: emrCategories,
    isPending: isLoadingEmrCategories,
    isError: isErrorEmrCategories,
    refetch: refetchEmrCategories,
  } = useCmnEmrCategories();

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetchEmrCategories();
    setIsRefreshing(false);
  }, [refetchEmrCategories]);

  const categoriesList = useMemo<CategoryOption[]>(() => {
    if (!Array.isArray(emrCategories)) return [];
    return [...emrCategories]
      .filter((cat: ICommonEMRCats) => cat.is_active !== false)
      .sort((a: ICommonEMRCats, b: ICommonEMRCats) => (a.sort_order || 0) - (b.sort_order || 0))
      .map((cat: ICommonEMRCats) => ({
        id: String(cat.id),
        name: cat.name,
        ...getCategoryVisualConfig(cat.name),
      }));
  }, [emrCategories]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.9,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <ScrollView
      contentContainerStyle={uploadRecordStyles.categoryScroll}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
    >
      {isLoadingEmrCategories ? (
        <View style={{ gap: 12 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(key => (
            <Animated.View
              key={key}
              style={[uploadRecordStyles.categorySkeletonCard, { opacity: pulseAnim }]}
            >
              <View style={uploadRecordStyles.categorySkeletonIcon} />
              <View style={uploadRecordStyles.categorySkeletonTitle} />
              <View style={uploadRecordStyles.categorySkeletonChevron} />
            </Animated.View>
          ))}
        </View>
      ) : isErrorEmrCategories ? (
        <CommonErrorCard
          title="Unable to Load Categories"
          message="Something went wrong while fetching medical record categories."
          onRetry={refetchEmrCategories}
        />
      ) : categoriesList.length === 0 ? (
        <View style={{ padding: 24, alignItems: 'center' }}>
          <Text style={{ fontSize: 14, color: '#94A3B8' }}>No active categories available.</Text>
        </View>
      ) : (
        categoriesList.map(cat => {
          const isSelected = cat.name.toLowerCase() === selectedCategory.toLowerCase();
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                uploadRecordStyles.categoryOptionCard,
                isSelected && uploadRecordStyles.categoryOptionCardSelected,
              ]}
              onPress={() => onSelectCategory(cat)}
              activeOpacity={0.7}
            >
              <View
                style={[uploadRecordStyles.categoryOptionIconWrap, { backgroundColor: cat.iconBg }]}
              >
                {cat.renderIcon()}
              </View>
              <Text style={uploadRecordStyles.categoryOptionTitle}>{cat.name}</Text>
              <ChevronRightIcon size={20} color={isSelected ? theme.colors.primary : '#CBD5E1'} />
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
};

export default StepCategorySelect;
