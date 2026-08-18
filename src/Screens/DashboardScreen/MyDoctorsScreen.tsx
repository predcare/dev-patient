import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { FlatList, RefreshControl, SafeAreaView, Text, View } from 'react-native';
import PopupAlert, { AlertType } from '../../components/commons/PopupAlert/PopupAlert';
import { DoctorCard, FindDoctorCard } from '../../components/Modules/Doctors';
import { StethoscopeIcon } from '../../components/ui/icons';
import { Header } from '../../Layout/Header';
import { MOCK_MY_DOCTORS, MyDoctorData } from '../../resources/mockData';
import { doctorStyles } from '../../styled/DoctorScreen.styled';
import { theme } from '../../styled/theme.styled';

interface PopupAlertState {
  visible: boolean;
  type?: AlertType;
  title?: string;
  message?: string;
  buttonText?: string;
  onPress?: () => void;
}

export const MyDoctorsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const rootNav = navigation.getParent() || navigation;

  const [doctors] = useState<MyDoctorData[]>(MOCK_MY_DOCTORS);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [alertConfig, setAlertConfig] = useState<PopupAlertState>({ visible: false });

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  const handleProfilePress = (doctor: MyDoctorData) => {
    rootNav.navigate('DoctorDetails', { doctorId: doctor.doctor_user_id, doctor });
  };

  const handleBookPress = (doctor: MyDoctorData) => {
    rootNav.navigate('BookAppointment', { doctorId: doctor.doctor_user_id, doctor });
  };

  const handleExploreDoctors = () => {
    rootNav.navigate('DoctorSearch');
  };
    console.log("called my dcotor screen")


  return (
    <SafeAreaView style={doctorStyles.container}>
      {/* Main Dashboard Header */}
      <Header />

      {/* FlatList for Doctors List */}
      <FlatList
        data={doctors}
        keyExtractor={item => String(item.doctor_user_id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={doctorStyles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 14 }}>
            <DoctorCard
              doctor={item}
              onProfilePress={handleProfilePress}
              onBookPress={handleBookPress}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={doctorStyles.emptyContainer}>
            <View style={doctorStyles.emptyIconWrapper}>
              <StethoscopeIcon size={32} color={theme.colors.primaryDark} />
            </View>
            <Text style={doctorStyles.emptyTitle}>No Doctors Added Yet</Text>
            <Text style={doctorStyles.emptyDescription}>
              Doctors you consult with or book appointments with will automatically appear here for
              easy access and rebooking.
            </Text>
          </View>
        }
        ListFooterComponent={
          <>
            <FindDoctorCard onExplorePress={handleExploreDoctors} />
            <View style={doctorStyles.bottomPadding} />
          </>
        }
      />

      {/* Popup Alert */}
      <PopupAlert
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        buttonText={alertConfig.buttonText}
        onPress={alertConfig.onPress || (() => setAlertConfig({ visible: false }))}
      />
    </SafeAreaView>
  );
};

export default MyDoctorsScreen;
