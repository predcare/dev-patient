import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import SafeAreaWrapper from '../../Layout/SafeAreaWrapper';
import {
  AppointmentCancelModal,
  AppointmentCard,
  AppointmentDeleteModal,
  BookNewSessionCard,
} from '../../components/Modules/Appointments';
import { CalendarIcon } from '../../components/ui/icons';
import { Header } from '../../Layout/Header';
import {
  MOCK_COMPLETED_APPOINTMENTS,
  MOCK_UPCOMING_APPOINTMENTS,
  MockAppointmentItem,
} from '../../resources/mockData';
import { appointmentsStyles } from '../../styled/AppointmentsScreen.styled';
import { theme } from '../../styled/theme.styled';

export const AppointmentsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const rootNav = navigation.getParent() || navigation;

  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [upcoming, setUpcoming] = useState<MockAppointmentItem[]>(MOCK_UPCOMING_APPOINTMENTS);
  const [completed, setCompleted] = useState<MockAppointmentItem[]>(MOCK_COMPLETED_APPOINTMENTS);
  const [refreshing, setRefreshing] = useState(false);

  // Modals state
  const [selectedCancelApt, setSelectedCancelApt] = useState<MockAppointmentItem | null>(null);
  const [selectedDeleteApt, setSelectedDeleteApt] = useState<MockAppointmentItem | null>(null);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  const handleJoinVideo = (apt: MockAppointmentItem) => {
    rootNav.navigate('Meeting', {
      appointmentId: apt.id,
      appointment: apt,
    });
  };

  const handleReschedule = (apt: MockAppointmentItem) => {
    rootNav.navigate('RescheduleAppointment', {
      appointmentId: apt.id,
      appointment: apt,
    });
  };

  const handleConfirmCancel = (apt: MockAppointmentItem) => {
    setUpcoming(prev => prev.filter(item => item.id !== apt.id));
    setCompleted(prev => [
      {
        ...apt,
        appointment_status: 'cancelled',
        payment_status: 'cancelled',
      },
      ...prev,
    ]);
  };

  const handleConfirmDelete = (apt: MockAppointmentItem) => {
    setCompleted(prev => prev.filter(item => item.id !== apt.id));
    setUpcoming(prev => prev.filter(item => item.id !== apt.id));
  };

  const currentList = activeTab === 'upcoming' ? upcoming : completed;

  console.log('called appointment screen');

  return (
    <SafeAreaWrapper style={appointmentsStyles.root}>
      <Header greeting="My Appointments" userName="Schedule & Visits" unreadCount={1} />

      {/* Segment Switcher */}
      <View style={appointmentsStyles.segmentWrap}>
        <View style={appointmentsStyles.segmentTrack}>
          {(['upcoming', 'completed'] as const).map(key => {
            const active = activeTab === key;
            return (
              <TouchableOpacity
                key={key}
                style={[
                  appointmentsStyles.segmentBtn,
                  active && appointmentsStyles.segmentBtnActive,
                ]}
                onPress={() => setActiveTab(key)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    appointmentsStyles.segmentTxt,
                    active && appointmentsStyles.segmentTxtActive,
                  ]}
                >
                  {key === 'upcoming' ? 'Upcoming' : 'Completed'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={appointmentsStyles.scroll}
        contentContainerStyle={appointmentsStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {currentList.length === 0 ? (
          <View style={appointmentsStyles.empty}>
            <View style={appointmentsStyles.emptyIconWrap}>
              <CalendarIcon size={32} color={theme.colors.primary} />
            </View>
            <Text style={appointmentsStyles.emptyH}>
              {activeTab === 'upcoming' ? 'No Upcoming Appointments' : 'No Completed Appointments'}
            </Text>
            <Text style={appointmentsStyles.emptyB}>
              {activeTab === 'upcoming'
                ? "You don't have any upcoming doctor consultations scheduled right now."
                : 'No completed or cancelled appointments yet.'}
            </Text>
          </View>
        ) : (
          currentList.map(apt => (
            <AppointmentCard
              key={apt.id}
              appointment={apt}
              activeTab={activeTab}
              onJoinVideo={handleJoinVideo}
              onReschedule={handleReschedule}
              onCancelPress={item => setSelectedCancelApt(item)}
              onDeletePress={item => setSelectedDeleteApt(item)}
            />
          ))
        )}

        {/* Book New Session Banner */}
        <BookNewSessionCard onPress={() => rootNav.navigate('DoctorSearch')} />
      </ScrollView>

      {/* Modals */}
      <AppointmentCancelModal
        visible={!!selectedCancelApt}
        appointment={selectedCancelApt}
        onClose={() => setSelectedCancelApt(null)}
        onConfirmCancel={handleConfirmCancel}
      />

      <AppointmentDeleteModal
        visible={!!selectedDeleteApt}
        appointment={selectedDeleteApt}
        onClose={() => setSelectedDeleteApt(null)}
        onConfirmDelete={handleConfirmDelete}
      />
    </SafeAreaWrapper>
  );
};

export default AppointmentsScreen;
