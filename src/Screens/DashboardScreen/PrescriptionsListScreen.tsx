import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  defaultPrescriptionFilters,
  PrescriptionCard,
  PrescriptionFilterModal,
  PrescriptionFilterValues,
} from '../../components/Modules/Prescriptions';
import {
  FilterIcon,
  PrescriptionIcon,
  SearchIcon,
} from '../../components/ui/icons';
import { Header } from '../../Layout/Header';
import {
  MOCK_PRESCRIPTIONS,
  PrescriptionDetailData,
} from '../../resources/mockData';
import { prescriptionsStyles } from '../../styled/PrescriptionsScreen.styled';
import { theme } from '../../styled/theme.styled';

export const PrescriptionsListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const rootNav = navigation.getParent() || navigation;

  const [prescriptions] = useState<PrescriptionDetailData[]>(MOCK_PRESCRIPTIONS);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<PrescriptionFilterValues>(defaultPrescriptionFilters);
  const [filterVisible, setFilterVisible] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const docQ = filters.doctorQuery.trim().toLowerCase();

    return prescriptions.filter(item => {
      const name = item.doctor_name.toLowerCase();
      const rx = item.rx_number.toLowerCase();
      if (q && !name.includes(q) && !rx.includes(q)) return false;
      if (docQ && !name.includes(docQ)) return false;
      return true;
    });
  }, [prescriptions, searchQuery, filters]);

  const filtersActive = !!filters.doctorQuery.trim() || !!filters.datePreset;

  const handleOpenDetail = (item: PrescriptionDetailData) => {
    rootNav.navigate('PrescriptionDetail', {
      prescriptionId: item.id,
      prescription: item,
    });
  };

  const handleDownloadPdf = (item: PrescriptionDetailData) => {
    Alert.alert(
      'Download Prescription',
      `Prescription ${item.rx_number} downloaded successfully to device Downloads folder.`,
      [{ text: 'OK' }],
    );
  };

  return (
    <SafeAreaView style={prescriptionsStyles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <Header greeting="Rx Prescriptions" userName="My Medical Records" unreadCount={1} />

      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={prescriptionsStyles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View style={prescriptionsStyles.searchRow}>
            <View style={prescriptionsStyles.searchBox}>
              <SearchIcon size={18} color={theme.colors.textMuted} />
              <TextInput
                style={prescriptionsStyles.searchInput}
                placeholder="Search prescriptions..."
                placeholderTextColor={theme.colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                autoCorrect={false}
              />
            </View>
            <TouchableOpacity
              style={[
                prescriptionsStyles.filterBtn,
                filtersActive && prescriptionsStyles.filterBtnActive,
              ]}
              onPress={() => setFilterVisible(true)}
              activeOpacity={0.8}
            >
              <FilterIcon
                size={20}
                color={filtersActive ? theme.colors.surface : theme.colors.primary}
              />
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <PrescriptionCard
            item={item}
            onPressDetail={handleOpenDetail}
            onDownloadPdf={handleDownloadPdf}
          />
        )}
        ListEmptyComponent={
          <View style={prescriptionsStyles.emptyWrap}>
            <View style={prescriptionsStyles.emptyIcon}>
              <PrescriptionIcon size={32} color={theme.colors.primary} />
            </View>
            <Text style={prescriptionsStyles.emptyTitle}>No Matching Prescriptions</Text>
            <Text style={prescriptionsStyles.emptySubtitle}>
              Try another search query or clear active filters.
            </Text>
            <TouchableOpacity
              style={prescriptionsStyles.refreshBtn}
              onPress={() => {
                setSearchQuery('');
                setFilters(defaultPrescriptionFilters);
              }}
            >
              <Text style={prescriptionsStyles.refreshText}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Prescription Filter Modal */}
      <PrescriptionFilterModal
        visible={filterVisible}
        initialValues={filters}
        onClose={() => setFilterVisible(false)}
        onApply={next => {
          setFilters(next);
          setFilterVisible(false);
        }}
      />
    </SafeAreaView>
  );
};

export default PrescriptionsListScreen;
