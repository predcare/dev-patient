import React from 'react';
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { memberStyles } from '../../../styled/MemberScreen.styled';
import { theme } from '../../../styled/theme.styled';
import { CheckIcon, CircleXIcon } from '../../ui/icons';

export interface FamilyMemberOption {
  id: number | string;
  name: string;
  relation: string;
  initials: string;
}

export interface FamilyMemberSelectSheetProps {
  visible: boolean;
  members: FamilyMemberOption[];
  selectedMemberId: number | string;
  onSelect: (member: FamilyMemberOption) => void;
  onClose: () => void;
}

export const FamilyMemberSelectSheet: React.FC<FamilyMemberSelectSheetProps> = ({
  visible,
  members,
  selectedMemberId,
  onSelect,
  onClose,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={memberStyles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={[memberStyles.modalSheet, { paddingHorizontal: 20, paddingTop: 16 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary }}>
                  Select Family Member
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <CircleXIcon size={22} color={theme.colors.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {members.map(member => {
                  const active = member.id === selectedMemberId;
                  return (
                    <TouchableOpacity
                      key={member.id}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingVertical: 12,
                        paddingHorizontal: 14,
                        borderRadius: 12,
                        backgroundColor: active ? theme.colors.primarySoft : theme.colors.surface,
                        borderWidth: 1,
                        borderColor: active ? theme.colors.primary : theme.colors.surfaceBorder,
                        marginBottom: 10,
                      }}
                      onPress={() => {
                        onSelect(member);
                        onClose();
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: theme.colors.primaryDark,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Text style={{ color: theme.colors.surface, fontWeight: '700', fontSize: 14 }}>
                            {member.initials}
                          </Text>
                        </View>
                        <View>
                          <Text style={{ fontSize: 15, fontWeight: '700', color: theme.colors.textPrimary }}>
                            {member.name}
                          </Text>
                          <Text style={{ fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 }}>
                            {member.relation}
                          </Text>
                        </View>
                      </View>

                      {active && <CheckIcon size={18} color={theme.colors.primaryDark} />}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default FamilyMemberSelectSheet;
