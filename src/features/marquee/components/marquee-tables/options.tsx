import { IconCheck, IconX, IconInfo, IconAlertTriangle, IconAlertCircle, IconBolt, IconSpeakerphone, IconPackage } from '@tabler/icons-react';

export const marqueeTypes = [
  {
    value: 'INFO',
    label: 'Info',
    icon: IconInfo
  },
  {
    value: 'SUCCESS',
    label: 'Success',
    icon: IconCheck
  },
  {
    value: 'WARNING',
    label: 'Warning',
    icon: IconAlertTriangle
  },
  {
    value: 'ERROR',
    label: 'Error',
    icon: IconX
  },
  {
    value: 'ALERT',
    label: 'Alert',
    icon: IconAlertCircle
  },
  {
    value: 'PROMOTION',
    label: 'Promotion',
    icon: IconSpeakerphone
  },
  {
    value: 'SYSTEM',
    label: 'System',
    icon: IconBolt
  },
  {
    value: 'INVENTORY',
    label: 'Inventory',
    icon: IconPackage
  }
];

export const statusOptions = [
  {
    value: true,
    label: 'Active',
    icon: IconCheck
  },
  {
    value: false,
    label: 'Inactive',
    icon: IconX
  }
];
