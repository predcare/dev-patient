import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { _toTitleCase, capitalize, formatDate } from '../../../lib/common/common.utils';
import { invoicesStyles } from '../../../styled/InvoicesScreen.styled';
import { theme } from '../../../styled/theme.styled';
import { CalendarIcon, CreditCardIcon, DownloadIcon, EyeIcon, InvoiceIcon } from '../../ui/icons';

interface InvoiceCardProps {
  onView: () => void;
  onDownload: () => void;
  invoiceNumber: string;
  date: string;
  paymentStatus: string;
  paymentMode: string;
  category: string;
  grandTotal: number;
}

export const InvoiceCard: React.FC<InvoiceCardProps> = ({
  category,
  grandTotal,
  paymentMode,
  paymentStatus,
  invoiceNumber,
  date,
  onDownload,
  onView,
}) => {
  return (
    <View style={invoicesStyles.card}>
      <View style={invoicesStyles.cardTopRow}>
        <View style={invoicesStyles.invoiceNumberContainer}>
          <InvoiceIcon size={18} color={theme.colors.primary} />
          <Text style={invoicesStyles.invoiceNumberText}>{invoiceNumber}</Text>
        </View>
        <View style={[invoicesStyles.statusBadge]}>
          <Text
            style={[
              invoicesStyles.statusBadgeText,
              invoicesStyles[paymentStatus?.toLowerCase() as keyof typeof invoicesStyles],
            ]}
          >
            {capitalize(paymentStatus)}
          </Text>
        </View>
      </View>

      <View style={invoicesStyles.doctorRow}>
        <View style={invoicesStyles.doctorInfo}>
          <Text style={invoicesStyles.doctorName} numberOfLines={2}>
            {_toTitleCase(category)}
          </Text>
        </View>
        <View style={invoicesStyles.amountContainer}>
          <Text style={invoicesStyles.amountLabel}>Total Amount</Text>
          <Text style={invoicesStyles.amountValue}>₹{grandTotal}</Text>
        </View>
      </View>
      <View style={invoicesStyles.metaRow}>
        <View style={invoicesStyles.metaItem}>
          <CalendarIcon size={14} color={theme.colors.textSlate} />
          <Text style={invoicesStyles.metaText}>{formatDate(date)}</Text>
        </View>
        <View style={invoicesStyles.metaItem}>
          <CreditCardIcon size={14} color={theme.colors.textSlate} />
          <Text style={invoicesStyles.metaText}>{paymentMode || 'Razorpay'}</Text>
        </View>
      </View>
      <View style={invoicesStyles.actionRow}>
        <TouchableOpacity
          style={invoicesStyles.downloadBtn}
          activeOpacity={0.7}
          onPress={onDownload}
        >
          <DownloadIcon size={16} color={theme.colors.primaryDark} strokeWidth={2.2} />
          <Text style={invoicesStyles.downloadBtnText}>Download PDF</Text>
        </TouchableOpacity>

        <TouchableOpacity style={invoicesStyles.viewBtn} activeOpacity={0.8} onPress={onView}>
          <EyeIcon size={16} color="#FFFFFF" strokeWidth={2.2} />
          <Text style={invoicesStyles.viewBtnText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default InvoiceCard;
