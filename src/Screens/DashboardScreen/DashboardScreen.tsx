import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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
import {
  DashboardNotificationItem,
  DashboardProfile,
  MOCK_DASHBOARD_PROFILE,
  MOCK_FAMILY_MEMBERS,
  MOCK_MY_DOCTORS,
  MOCK_NOTIFICATIONS,
  MockFamilyMember,
  MyDoctorData,
} from '../../resources/mockData';
import { dashboardStyles } from '../../styled/DashboardScreen.styled';
import { theme } from '../../styled/theme.styled';

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const rootNav = navigation.getParent() || navigation;

  // Static state management matching reference DashboardScreen
  const [profile, setProfile] = useState<DashboardProfile>(MOCK_DASHBOARD_PROFILE);
  const [familyMembers] = useState<MockFamilyMember[]>(MOCK_FAMILY_MEMBERS);
  const [activeMemberId, setActiveMemberId] = useState<string>('self');
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Modals state
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showMemberSheet, setShowMemberSheet] = useState<boolean>(false);
  const [notifications] = useState<DashboardNotificationItem[]>(MOCK_NOTIFICATIONS);

  const [myDoctors] = useState<MyDoctorData[]>(MOCK_MY_DOCTORS);

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

  const handleDoctorPress = (doctor: MyDoctorData) => {
    rootNav.navigate('DoctorDetails', { doctorId: doctor.doctor_user_id, doctor });
  };

  const handleBookDoctorPress = (doctor: MyDoctorData) => {
    rootNav.navigate('BookAppointment', { doctorId: doctor.doctor_user_id, doctor });
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

  console.log('called home screen');

  return (
    <SafeAreaView style={dashboardStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* Viewing Family Member Banner */}
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

      {/* Main Dashboard Header */}
      <Header
        greeting="Welcome back,"
        userName={profile.name}
        profileImageUrl={profile.profile_picture}
        initials={profile.name ? profile.name.slice(0, 2).toUpperCase() : 'JD'}
        unreadCount={notifications.length}
        notifications={notifications}
        onProfilePress={() => setShowProfileModal(true)}
      />

      {/* Main Dashboard Scrollable Content */}
      <ScrollView
        style={dashboardStyles.scrollView}
        contentContainerStyle={dashboardStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Profile Completion Card (if incomplete) */}
        {activeMemberId === 'self' && (
          <ProfileCompletionCard percent={75} onPress={() => rootNav.navigate('ProfileSetup')} />
        )}

        {/* 1. My Doctors Section */}
        {activeMemberId === 'self' && (
          <MyDoctorsSection
            doctors={myDoctors}
            onEmptyActionPress={() => rootNav.navigate('DoctorSearch')}
            onSeeAllPress={() => navigation.navigate('Doctors')}
            onDoctorPress={handleDoctorPress}
            onBookPress={handleBookDoctorPress}
          />
        )}

        {/* 2. Find Specialist Card Banner */}
        <View style={dashboardStyles.blockSpacing}>
          <FindSpecialistCard onPress={() => rootNav.navigate('DoctorSearch')} />
        </View>

        {/* 3. Upcoming Consultations Section */}
        {activeMemberId === 'self' && (
          <UpcomingAppointmentsSection
            appointments={upcoming}
            onEmptyActionPress={() => rootNav.navigate('DoctorSearch')}
            onSeeAllPress={() => rootNav.navigate('DoctorSearch')}
            onAppointmentPress={handleAppointmentAction}
          />
        )}

        {/* 4. Quick Access Grid (2 columns) */}
        <QuickAccessGrid items={quickAccessItems} />

        {/* 5. Daily Health Tips Horizontal Snap Scroll Section */}
        <DailyHealthTipsSection />
      </ScrollView>

      {/* Interactive Modals */}
      <DashboardModals
        showProfileModal={showProfileModal}
        onCloseProfileModal={() => setShowProfileModal(false)}
        profile={profile}
        familyMembers={familyMembers}
        activeMemberId={activeMemberId}
        onSwitchMember={handleSwitchMember}
        onEditProfile={() => {
          setShowProfileModal(false);
          rootNav.navigate('ProfileSetup');
        }}
        onAddNewMember={() => {
          setShowProfileModal(false);
          rootNav.navigate('AddNewMember');
        }}
        onOpenSettings={() => {
          setShowProfileModal(false);
          rootNav.navigate('MainTabs', { screen: 'Account' });
        }}
        onSignOut={() => {
          setShowProfileModal(false);
          Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Sign Out',
              style: 'destructive',
              onPress: () => rootNav.navigate('Login'),
            },
          ]);
        }}
        showMemberSheet={showMemberSheet}
        onCloseMemberSheet={() => setShowMemberSheet(false)}
      />
    </SafeAreaView>
  );
};

export default DashboardScreen;
