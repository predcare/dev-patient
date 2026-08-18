import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { theme } from '../../../styled/theme.styled';

export interface SignatureControlProps {
  sigMode: 'upload' | 'generated';
  onModeChange: (mode: 'upload' | 'generated') => void;
  signatureUrl?: string | null;
  typedName?: string;
  onTypedNameChange?: (name: string) => void;
  onUploadPress?: () => void;
  onRemovePress?: () => void;
}

export const SignatureControl: React.FC<SignatureControlProps> = React.memo(
  ({
    sigMode,
    onModeChange,
    signatureUrl,
    typedName = '',
    onTypedNameChange,
    onUploadPress,
    onRemovePress,
  }) => (
    <View style={styles.card}>
      <Text style={styles.fieldLabel}>Authorised Signature</Text>

      {/* Mode Switcher Buttons */}
      <View style={styles.sigModeRow}>
        <TouchableOpacity
          style={[styles.sigModeBtn, sigMode === 'upload' && styles.sigModeBtnActive]}
          onPress={() => onModeChange('upload')}
          activeOpacity={0.8}
        >
          <Text style={[styles.sigModeTxt, sigMode === 'upload' && styles.sigModeTxtActive]}>
            ✍️ Upload Signature
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sigModeBtn, sigMode === 'generated' && styles.sigModeBtnActive]}
          onPress={() => onModeChange('generated')}
          activeOpacity={0.8}
        >
          <Text style={[styles.sigModeTxt, sigMode === 'generated' && styles.sigModeTxtActive]}>
            🖋 Computer Generated
          </Text>
        </TouchableOpacity>
      </View>

      {/* Upload Mode */}
      {sigMode === 'upload' &&
        (signatureUrl ? (
          <View style={{ marginTop: 12 }}>
            <View style={styles.sigPreviewWrap}>
              <Image source={{ uri: signatureUrl }} style={styles.sigPreview} resizeMode="contain" />
            </View>
            <View style={styles.imageActions}>
              <TouchableOpacity
                style={styles.changeImgBtn}
                onPress={onUploadPress}
                activeOpacity={0.8}
              >
                <Text style={styles.changeImgTxt}>🔄 Change</Text>
              </TouchableOpacity>
              {onRemovePress && (
                <TouchableOpacity
                  style={styles.removeImgBtn}
                  onPress={onRemovePress}
                  activeOpacity={0.8}
                >
                  <Text style={styles.removeImgTxt}>✕ Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.uploadBox, { marginTop: 12 }]}
            onPress={onUploadPress}
            activeOpacity={0.7}
          >
            <Text style={styles.uploadBoxIcon}>📷</Text>
            <Text style={styles.uploadBoxText}>Tap to upload from Camera or Gallery</Text>
            <Text style={styles.uploadBoxHint}>PNG or JPG · White background · Wide format</Text>
          </TouchableOpacity>
        ))}

      {/* Generated Mode */}
      {sigMode === 'generated' && (
        <View style={{ marginTop: 12 }}>
          <TextInput
            style={styles.input}
            value={typedName}
            onChangeText={onTypedNameChange}
            placeholder="Type your full name"
            placeholderTextColor={theme.colors.textMuted}
            autoCapitalize="words"
          />
          {typedName.trim() ? (
            <View style={styles.generatedSigPreview}>
              <Text style={styles.generatedSigText}>{typedName}</Text>
              <View style={styles.generatedSigLine} />
              <Text style={styles.generatedSigLabel}>DOCTOR'S SIGNATURE</Text>
            </View>
          ) : (
            <View style={[styles.generatedSigPreview, { backgroundColor: '#F9FAFB' }]}>
              <Text style={{ fontSize: 12, color: theme.colors.textMuted, textAlign: 'center' }}>
                Your name will appear here in signature style
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  )
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    marginBottom: 8,
    borderRadius: 10,
    padding: 12,
    shadowColor: theme.colors.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.dark,
    marginBottom: 7,
  },
  sigModeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  sigModeBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
  },
  sigModeBtnActive: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primary,
  },
  sigModeTxt: {
    fontSize: 11,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textMuted,
  },
  sigModeTxtActive: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.bold,
  },
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: theme.colors.mintBdr,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    backgroundColor: theme.colors.primarySoft,
  },
  uploadBoxIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  uploadBoxText: {
    fontSize: 12,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
    marginBottom: 3,
  },
  uploadBoxHint: {
    fontSize: 10,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  sigPreviewWrap: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sigPreview: {
    width: '100%',
    height: 60,
  },
  imageActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  changeImgBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
  },
  changeImgTxt: {
    fontSize: 12,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
  removeImgBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: theme.colors.danger,
    borderRadius: 8,
    paddingVertical: 8,
  },
  removeImgTxt: {
    fontSize: 12,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.danger,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    borderRadius: 9,
    paddingHorizontal: 11,
    paddingVertical: 9,
    fontSize: 13,
    color: theme.colors.dark,
    backgroundColor: theme.colors.background,
  },
  generatedSigPreview: {
    marginTop: 10,
    padding: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.mintBdr,
  },
  generatedSigText: {
    fontSize: 20,
    fontStyle: 'italic',
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: 4,
  },
  generatedSigLine: {
    width: 140,
    height: 1,
    backgroundColor: theme.colors.primary,
    marginBottom: 4,
  },
  generatedSigLabel: {
    fontSize: 8,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textMuted,
    letterSpacing: 0.8,
  },
});

export default SignatureControl;
