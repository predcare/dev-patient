import React, { useState } from 'react';
import { PermissionsAndroid, Platform, Text, TouchableOpacity, View } from 'react-native';
import { safeLaunchCamera, safeLaunchImageLibrary } from '../../../../lib/common/imagePicker.utils';
import { showInfoToast } from '../../../../lib/common/toast.utils';
import { uploadRecordStyles } from '../../../../styled/UploadHealthRecordScreen.styled';
import UploadOptionsModal from '../../../commons/UploadOptionsModal/UploadOptionsModal';
import { CameraIcon, ChevronRightIcon, FolderIcon, GalleryIcon } from '../../../ui/icons';

export interface StepUploadMethodProps {
  onFileSelected: (file: {
    uri: string;
    name: string;
    type: string;
    size?: number | string;
  }) => void;
  error?: string;
}

export const StepUploadMethod: React.FC<StepUploadMethodProps> = ({ onFileSelected, error }) => {
  const [showUploadOptions, setShowUploadOptions] = useState<boolean>(false);

  const handleCamera = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
          title: 'Camera Permission Required',
          message: 'App requires access to your camera to take medical record photos.',
          buttonPositive: 'OK',
          buttonNegative: 'Cancel',
        });
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          showInfoToast('Camera permission is required to capture photos', 'Camera Permission');
          return;
        }
      }

      setShowUploadOptions(false);

      safeLaunchCamera(
        {
          mediaType: 'photo',
          quality: 0.8,
          saveToPhotos: false,
          includeBase64: false,
        },
        res => {
          if (res.didCancel) return;
          if (res.errorCode) {
            console.warn('launchCamera errorCode:', res.errorCode, res.errorMessage);
            showInfoToast(
              res.errorMessage || `Camera Error: ${res.errorCode}`,
              'Camera Failure'
            );
            return;
          }
          if (res.assets && res.assets[0]) {
            const asset = res.assets[0];
            const fileObj = {
              uri: asset.uri || '',
              name: asset.fileName || `record_${Date.now()}.jpg`,
              type: asset.type || 'image/jpeg',
              size: asset.fileSize,
            };
            onFileSelected(fileObj);
          }
        }
      );
    } catch (err: any) {
      console.warn('handleCamera error:', err);
      showInfoToast('Could not open camera', 'Camera Error');
    }
  };

  const handleGallery = () => {
    try {
      setShowUploadOptions(false);

      safeLaunchImageLibrary(
        {
          mediaType: 'mixed',
          quality: 0.8,
          selectionLimit: 1,
          includeBase64: false,
        },
        res => {
          if (res.didCancel) return;
          if (res.errorCode) {
            console.warn('launchImageLibrary errorCode:', res.errorCode, res.errorMessage);
            showInfoToast(
              res.errorMessage || `Gallery Error: ${res.errorCode}`,
              'Gallery Failure'
            );
            return;
          }
          if (res.assets && res.assets[0]) {
            const asset = res.assets[0];
            const fileObj = {
              uri: asset.uri || '',
              name: asset.fileName || `record_${Date.now()}.png`,
              type: asset.type || 'image/png',
              size: asset.fileSize,
            };
            onFileSelected(fileObj);
          }
        }
      );
    } catch (err: any) {
      console.warn('handleGallery error:', err);
      showInfoToast('Could not open gallery', 'Gallery Error');
    }
  };

  return (
    <View style={uploadRecordStyles.step2Body}>
      <Text style={uploadRecordStyles.step2Title}>Choose Upload Method</Text>
      <Text style={uploadRecordStyles.step2Subtitle}>
        How would you like to add your health records?
      </Text>

      {error ? (
        <Text style={[uploadRecordStyles.errorText, { marginBottom: 16 }]}>{error}</Text>
      ) : null}

      <TouchableOpacity
        style={uploadRecordStyles.methodCard}
        onPress={handleGallery}
        activeOpacity={0.7}
      >
        <View style={[uploadRecordStyles.methodIconBox, { backgroundColor: '#E0F2FE' }]}>
          <GalleryIcon size={24} color="#0284C7" />
        </View>
        <View style={uploadRecordStyles.methodInfo}>
          <Text style={uploadRecordStyles.methodName}>Photo Gallery</Text>
          <Text style={uploadRecordStyles.methodDesc}>Choose from photos</Text>
        </View>
        <ChevronRightIcon size={20} color="#CBD5E1" />
      </TouchableOpacity>

      <TouchableOpacity
        style={uploadRecordStyles.methodCard}
        onPress={handleCamera}
        activeOpacity={0.7}
      >
        <View style={[uploadRecordStyles.methodIconBox, { backgroundColor: '#DCFCE7' }]}>
          <CameraIcon size={24} color="#16A34A" />
        </View>
        <View style={uploadRecordStyles.methodInfo}>
          <Text style={uploadRecordStyles.methodName}>Use your camera</Text>
          <Text style={uploadRecordStyles.methodDesc}>Take a Photo</Text>
        </View>
        <ChevronRightIcon size={20} color="#CBD5E1" />
      </TouchableOpacity>

      <TouchableOpacity
        style={uploadRecordStyles.methodCard}
        onPress={handleGallery}
        activeOpacity={0.7}
      >
        <View style={[uploadRecordStyles.methodIconBox, { backgroundColor: '#F1F5F9' }]}>
          <FolderIcon size={24} color="#475569" />
        </View>
        <View style={uploadRecordStyles.methodInfo}>
          <Text style={uploadRecordStyles.methodName}>Browse files</Text>
          <Text style={uploadRecordStyles.methodDesc}>PDF, Word & images</Text>
        </View>
        <ChevronRightIcon size={20} color="#CBD5E1" />
      </TouchableOpacity>

      <UploadOptionsModal
        visible={showUploadOptions}
        title="Upload Document"
        subtitle="Choose a source to attach your health record"
        onClose={() => setShowUploadOptions(false)}
        onSelectCamera={handleCamera}
        onSelectGallery={handleGallery}
      />
    </View>
  );
};

export default StepUploadMethod;
