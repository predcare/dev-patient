import React from 'react';
import { Text, View } from 'react-native';
import { uploadRecordStyles } from '../../../../styled/UploadHealthRecordScreen.styled';
import { CheckIcon } from '../../../ui/icons';

export interface UploadStepperProps {
  currentStep: 1 | 2 | 3;
}

export const UploadStepper: React.FC<UploadStepperProps> = ({ currentStep }) => {
  return (
    <View style={uploadRecordStyles.stepperContainer}>
      {/* Step 1 Node */}
      <View style={uploadRecordStyles.stepItem}>
        <View
          style={[
            uploadRecordStyles.stepCircle,
            currentStep > 1
              ? uploadRecordStyles.stepCircleCompleted
              : currentStep === 1
              ? uploadRecordStyles.stepCircleActive
              : uploadRecordStyles.stepCircleInactive,
          ]}
        >
          {currentStep > 1 ? (
            <CheckIcon size={14} color="#FFFFFF" strokeWidth={2.5} />
          ) : (
            <Text
              style={[uploadRecordStyles.stepCircleText, uploadRecordStyles.stepCircleTextActive]}
            >
              1
            </Text>
          )}
        </View>
        <Text
          style={[
            uploadRecordStyles.stepLabel,
            currentStep >= 1
              ? uploadRecordStyles.stepLabelActive
              : uploadRecordStyles.stepLabelInactive,
          ]}
        >
          Category
        </Text>
      </View>

      {/* Line 1-2 */}
      <View
        style={[
          uploadRecordStyles.stepLine,
          currentStep >= 2
            ? uploadRecordStyles.stepLineActive
            : uploadRecordStyles.stepLineInactive,
        ]}
      />

      {/* Step 2 Node */}
      <View style={uploadRecordStyles.stepItem}>
        <View
          style={[
            uploadRecordStyles.stepCircle,
            currentStep > 2
              ? uploadRecordStyles.stepCircleCompleted
              : currentStep === 2
              ? uploadRecordStyles.stepCircleActive
              : uploadRecordStyles.stepCircleInactive,
          ]}
        >
          {currentStep > 2 ? (
            <CheckIcon size={14} color="#FFFFFF" strokeWidth={2.5} />
          ) : (
            <Text
              style={[
                uploadRecordStyles.stepCircleText,
                currentStep >= 2
                  ? uploadRecordStyles.stepCircleTextActive
                  : uploadRecordStyles.stepCircleTextInactive,
              ]}
            >
              2
            </Text>
          )}
        </View>
        <Text
          style={[
            uploadRecordStyles.stepLabel,
            currentStep >= 2
              ? uploadRecordStyles.stepLabelActive
              : uploadRecordStyles.stepLabelInactive,
          ]}
        >
          File
        </Text>
      </View>

      {/* Line 2-3 */}
      <View
        style={[
          uploadRecordStyles.stepLine,
          currentStep >= 3
            ? uploadRecordStyles.stepLineActive
            : uploadRecordStyles.stepLineInactive,
        ]}
      />

      {/* Step 3 Node */}
      <View style={uploadRecordStyles.stepItem}>
        <View
          style={[
            uploadRecordStyles.stepCircle,
            currentStep === 3
              ? uploadRecordStyles.stepCircleActive
              : uploadRecordStyles.stepCircleInactive,
          ]}
        >
          <Text
            style={[
              uploadRecordStyles.stepCircleText,
              currentStep === 3
                ? uploadRecordStyles.stepCircleTextActive
                : uploadRecordStyles.stepCircleTextInactive,
            ]}
          >
            3
          </Text>
        </View>
        <Text
          style={[
            uploadRecordStyles.stepLabel,
            currentStep === 3
              ? uploadRecordStyles.stepLabelActive
              : uploadRecordStyles.stepLabelInactive,
          ]}
        >
          Details
        </Text>
      </View>
    </View>
  );
};

export default UploadStepper;
