import React from 'react';
import { navigationRef } from '../../../navigation/navigationRef';
import { AppRoute } from '../../../route';
import { useIncomingCallStore } from '../../../zustand/stores/useIncomingCallStore';
import IncomingCallBanner from './IncomingCallBanner';

export const GlobalIncomingCallBanner: React.FC = () => {
  const visible = useIncomingCallStore(state => state.visible);
  const doctorName = useIncomingCallStore(state => state.doctorName);
  const callType = useIncomingCallStore(state => state.callType);
  const onJoin = useIncomingCallStore(state => state.onJoin);

  if (!visible) return null;

  const handleJoin = () => {
    if (onJoin) {
      onJoin();
    } else if (navigationRef.isReady()) {
      (navigationRef as any).navigate(AppRoute.MEETING || 'Meeting');
    }
  };

  return (
    <IncomingCallBanner
      visible={visible}
      doctorName={doctorName}
      callType={callType}
      onJoin={handleJoin}
    />
  );
};

export default GlobalIncomingCallBanner;
