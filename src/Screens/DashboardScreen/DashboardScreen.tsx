import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import {
  DailyHealthTipsSection,
  DashboardModals,
  FindSpecialistCard,
  MyDoctorsSection,
  ProfileCompletionCard,
  QuickAccessGrid,
  UpcomingAppointmentsSection,
} from '../../components/Modules/Dashboard';
import { Header } from '../../Layout/Header';
import SafeAreaWrapper from '../../Layout/SafeAreaWrapper';
import { getProfileCompletion } from '../../lib/common/common.utils';
import {
  DashboardNotificationItem,
  DashboardProfile,
  MOCK_DASHBOARD_PROFILE,
  MOCK_FAMILY_MEMBERS,
  MOCK_NOTIFICATIONS,
  MockFamilyMember,
} from '../../resources/mockData';
import { AppRoute } from '../../route';
import { dashboardStyles } from '../../styled/DashboardScreen.styled';
import { useAuthStore } from '../../zustand/stores/useAuthStore';

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const rootNav = navigation.getParent() || navigation;
  const { userData } = useAuthStore(state => state);
  // Static state management matching reference DashboardScreen
  const [profile, setProfile] = useState<DashboardProfile>(MOCK_DASHBOARD_PROFILE);
  const [familyMembers] = useState<MockFamilyMember[]>(MOCK_FAMILY_MEMBERS);
  const [activeMemberId, setActiveMemberId] = useState<string>('self');
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Modals state
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [notifications] = useState<DashboardNotificationItem[]>(MOCK_NOTIFICATIONS);

  // Mock static upcoming appointment matching reference
  const [upcoming] = useState<any[]>([
    {
      id: 501,
      appointment_id: 'APT-8821',
      doctor_name: 'Sarah Jenkins',
      specialization: 'Cardiologist • MD',
      appointment_date: '2026-08-24',
      appointment_date_label: 'Mon, 24 Aug 2026',
      start_time: '10:30 AM',
      consultation_type: 'video',
    },
  ]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  // Switch Active Family Member
  const handleSwitchMember = (memberId: string) => {
    setActiveMemberId(memberId);
    if (memberId === 'self') {
      setProfile(MOCK_DASHBOARD_PROFILE);
    } else {
      const selected = familyMembers.find(m => m.id === memberId);
      if (selected) {
        setProfile({
          id: Number(selected.id) || 2,
          user_id: Number(selected.id) || 1002,
          name: selected.name,
          email: `${selected.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
          phone_number: '+91 98765 12345',
          gender: 'Female',
          date_of_birth: '1996-08-10',
          profile_picture: selected.profile_picture || null,
          isFamilyMember: true,
          relation: selected.relation,
        });
      }
    }
  };

  const handleAppointmentAction = (appointment: any) => {
    Alert.alert(
      'Appointment Details',
      `Appointment with ${appointment.doctor_name} on ${appointment.appointment_date_label} at ${appointment.start_time}`,
      [
        {
          text: 'Book Again',
          onPress: () =>
            rootNav.navigate('BookAppointment', {
              doctorId: appointment.doctor_id || 101,
            }),
        },
        {
          text: 'Doctor Profile',
          onPress: () =>
            rootNav.navigate('DoctorDetails', {
              doctorId: appointment.doctor_id || 101,
            }),
        },
        { text: 'Close', style: 'cancel' },
      ]
    );
  };

  const quickAccessItems = [
    {
      key: 'appointments',
      label: 'Appointments',
      icon: 'appointments' as const,
      onPress: () => rootNav.navigate('DoctorSearch'),
    },
    {
      key: 'doctors',
      label: 'My Doctors',
      icon: 'doctors' as const,
      onPress: () => navigation.navigate('Doctors'),
    },
    {
      key: 'prescriptions',
      label: 'Prescriptions',
      icon: 'prescriptions' as const,
      onPress: () => rootNav.navigate('DoctorSearch'),
    },
    {
      key: 'records',
      label: 'Health Records',
      icon: 'records' as const,
      onPress: () => Alert.alert('Health Records', 'Health Records feature coming soon.'),
    },
    {
      key: 'insurance',
      label: 'Insurance',
      icon: 'insurance' as const,
      onPress: () => Alert.alert('Insurance', 'Insurance feature coming soon.'),
    },
    {
      key: 'reports',
      label: 'Reports',
      icon: 'reports' as const,
      onPress: () => navigation.navigate('Reports'),
    },
    {
      key: 'invoices',
      label: 'Invoices',
      icon: 'invoices' as const,
      onPress: () => Alert.alert('Invoices', 'Invoices feature coming soon.'),
    },
    {
      key: 'support',
      label: 'Support',
      icon: 'support' as const,
      onPress: () => rootNav.navigate('Support'),
    },
  ];

  const { isCompleted, percentage } = useMemo(() => {
    return getProfileCompletion(userData);
  }, [userData]);

  return (
    <SafeAreaWrapper
      style={dashboardStyles.container}
      showBottomBar={true}
      activeBottomTab="Home"
      isPathClear={true}
    >
      {profile.isFamilyMember && (
        <View style={dashboardStyles.memberBanner}>
          <Text style={dashboardStyles.memberBannerIcon}>👨‍👩‍👧</Text>
          <Text style={dashboardStyles.memberBannerText}>
            Viewing {profile.name} {profile.relation ? `· ${profile.relation}` : ''}
          </Text>
          <TouchableOpacity
            style={dashboardStyles.memberBannerBack}
            onPress={() => handleSwitchMember('self')}
            activeOpacity={0.8}
          >
            <Text style={dashboardStyles.memberBannerBackText}>Switch to Me</Text>
          </TouchableOpacity>
        </View>
      )}

      <Header
        greeting="Welcome back,"
        userName={profile.name}
        profileImageUrl={profile.profile_picture}
        initials={profile.name ? profile.name.slice(0, 2).toUpperCase() : 'JD'}
        unreadCount={notifications.length}
        notifications={notifications}
        onProfilePress={() => setShowProfileModal(true)}
      />
      <ScrollView
        style={dashboardStyles.scrollView}
        contentContainerStyle={dashboardStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {!isCompleted && (
          <ProfileCompletionCard
            percent={percentage}
            onPress={() => rootNav.navigate(AppRoute.PROFILE_SETUP)}
          />
        )}
        {activeMemberId === 'self' && <MyDoctorsSection />}
        <View style={dashboardStyles.blockSpacing}>
          <FindSpecialistCard onPress={() => rootNav.navigate('DoctorSearch')} />
        </View>
        {activeMemberId === 'self' && (
          <UpcomingAppointmentsSection
            appointments={upcoming}
            onEmptyActionPress={() => rootNav.navigate('DoctorSearch')}
            onSeeAllPress={() => rootNav.navigate('DoctorSearch')}
            onAppointmentPress={handleAppointmentAction}
          />
        )}
        <QuickAccessGrid items={quickAccessItems} />
        <DailyHealthTipsSection />
      </ScrollView>
      <DashboardModals
        showProfileModal={showProfileModal}
        onCloseProfileModal={() => setShowProfileModal(false)}
      />
    </SafeAreaWrapper>
  );
};

export default DashboardScreen;
