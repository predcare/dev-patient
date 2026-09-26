import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useDownloadInvoicePdf,
  useGetAllInvoiceInfo,
} from '../../../hooks/react-query/invoices/invoices.hooks';
import { formatDate } from '../../../lib/common/common.utils';
import { handleInvoicePdfAction } from '../../../lib/common/file.utils';
import { showErrorToast } from '../../../lib/common/toast.utils';
import { theme } from '../../../styled/theme.styled';
import { IInvoiceListItem } from '../../../typescripts/interfaces/invoices.interfaces';
import { InvoiceDetailsSkeleton } from '../../Skeletons/InvoiceDetailsSkeleton';
import { CircleXIcon, DownloadIcon } from '../../ui/icons';

interface InvoiceDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  invoiceId: number;
}

export const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({
  visible,
  onClose,
  invoiceId,
}) => {
  const { data: invoice, isFetching: invoiceInfoLoading } = useGetAllInvoiceInfo(invoiceId);
  const { mutate: downloadPdf, isPending: isDownloading } = useDownloadInvoicePdf();

  const calculations = useMemo(() => {
    if (!invoice) {
      return {
        subtotalNum: 0,
        totalDiscountNum: 0,
        cgstNum: 0,
        sgstNum: 0,
        igstNum: 0,
        grandTotalNum: 0,
        isPaid: false,
        isOverdue: false,
        statusBg: '#FEF3C7',
        statusColor: '#B45309',
        statusText: 'PENDING',
        patientName: 'Patient',
        patientId: '',
        invoiceNumber: '',
        paymentMode: 'Razorpay',
      };
    }

    const subtotalNum = parseFloat(String(invoice.subtotal || invoice.grand_total || 0));
    const totalDiscountNum = parseFloat(String(invoice.total_discount || 0));
    const cgstNum = parseFloat(String(invoice.cgst || 0));
    const sgstNum = parseFloat(String(invoice.sgst || 0));
    const igstNum = parseFloat(String(invoice.igst || 0));
    const grandTotalNum = parseFloat(String(invoice.grand_total || 0));

    const rawStatus = String(invoice.payment_status || 'pending')
      .toLowerCase()
      .trim();
    const isPaid = rawStatus === 'paid';
    const isOverdue = rawStatus === 'overdue' || rawStatus === 'failed';
    const statusBg = isPaid ? theme.colors.successSoft : isOverdue ? '#FEE2E2' : '#FEF3C7';
    const statusColor = isPaid ? theme.colors.success : isOverdue ? '#DC2626' : '#B45309';

    return {
      subtotalNum,
      totalDiscountNum,
      cgstNum,
      sgstNum,
      igstNum,
      grandTotalNum,
      isPaid,
      isOverdue,
      statusBg,
      statusColor,
      statusText: (invoice.payment_status || 'PAID').toUpperCase(),
      patientName: invoice.patientInfo?.name || 'Patient',
      patientId:
        invoice.patientInfo?.displayPatientId ||
        (invoice.patient_id ? `#${invoice.patient_id}` : ''),
      invoiceNumber: invoice.invoice_number || '',
      paymentMode: invoice.payment_mode || 'Razorpay',
    };
  }, [invoice]);

  const handleSavePDF = () => {
    if (!invoice?.id) {
      showErrorToast('Invoice ID is missing', 'Cannot Download PDF');
      return;
    }
    downloadPdf(Number(invoice.id), {
      onSuccess: bytes => {
        handleInvoicePdfAction(invoice, 'save', bytes);
      },
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />

        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Tax Invoice / Receipt Preview</Text>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <CircleXIcon size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          {invoiceInfoLoading || !invoice ? (
            <InvoiceDetailsSkeleton />
          ) : (
            <ScrollView
              style={styles.paperScroll}
              contentContainerStyle={styles.paperContent}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
              bounces={true}
            >
              {invoice.clinicInfo ? (
                <>
                  <View style={styles.paperHeader}>
                    <View style={styles.clinicDetails}>
                      <Text style={styles.paperClinicName}>{invoice.clinicInfo.name}</Text>
                      {invoice.clinicInfo.fulladdress ? (
                        <Text style={styles.paperClinicSub}>{invoice.clinicInfo.fulladdress}</Text>
                      ) : null}
                      <View
                        style={{ flexDirection: 'row', gap: 8, marginTop: 4, flexWrap: 'wrap' }}
                      >
                        {invoice.clinicInfo.gstin ? (
                          <Text style={styles.metaTag}>GSTIN: {invoice.clinicInfo.gstin}</Text>
                        ) : null}
                      </View>
                      <View
                        style={{ flexDirection: 'row', gap: 8, marginTop: 4, flexWrap: 'wrap' }}
                      >
                        {invoice.clinicInfo.clinicRegNumber ? (
                          <Text style={styles.metaTag}>
                            Reg: {invoice.clinicInfo.clinicRegNumber}
                          </Text>
                        ) : null}
                      </View>
                    </View>

                    <View style={styles.invoiceBadgeBox}>
                      <Text style={styles.paperInvTitle}>TAX INVOICE</Text>
                      {calculations.invoiceNumber ? (
                        <Text style={styles.paperInvNum}>{calculations.invoiceNumber}</Text>
                      ) : null}
                    </View>
                  </View>
                  <View style={styles.paperDivider} />
                </>
              ) : null}
              {invoice.doctorInfo ? (
                <View style={styles.doctorInfoRow}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.labelTitle}>Doctor Info:</Text>
                    <Text style={styles.doctorName}>Dr. {invoice.doctorInfo.name}</Text>
                    {invoice.doctorInfo.specialization ? (
                      <Text style={styles.doctorSub}>{invoice.doctorInfo.specialization}</Text>
                    ) : null}
                  </View>
                  {invoice.doctorInfo.licenseNumber ? (
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.labelTitle}>LICENSE NO:</Text>
                      <Text style={styles.patientMeta}>{invoice.doctorInfo.licenseNumber}</Text>
                    </View>
                  ) : null}
                </View>
              ) : null}
              <View style={styles.billedToRow}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.labelTitle}>BILLED TO:</Text>
                  <Text style={styles.patientName}>{calculations.patientName}</Text>
                  {calculations.patientId ? (
                    <Text style={styles.patientMeta}>ID: {calculations.patientId}</Text>
                  ) : null}
                  {invoice.patientInfo?.phoneNumber ? (
                    <Text style={styles.patientMeta}>Tel: {invoice.patientInfo.phoneNumber}</Text>
                  ) : null}
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.labelTitle}>INVOICE NUMBER:</Text>
                  {calculations.invoiceNumber ? (
                    <Text style={styles.paperInvNum}>{calculations.invoiceNumber}</Text>
                  ) : null}
                  {invoice.created_at ? (
                    <Text style={styles.paperInvDate}>
                      Date: {formatDate(invoice.created_at, 'DD MMM YYYY')}
                    </Text>
                  ) : null}
                  <View
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}
                  >
                    <View style={[styles.statusPill, { backgroundColor: calculations.statusBg }]}>
                      <Text style={[styles.statusTxt, { color: calculations.statusColor }]}>
                        {calculations.statusText}
                      </Text>
                    </View>
                    <Text style={styles.modeTxt}>Mode: {calculations.paymentMode}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.tableContainer}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.thCell, { flex: 2 }]}>Items</Text>
                  <Text style={[styles.thCell, { flex: 0.6, textAlign: 'center' }]}>Qty</Text>
                  <Text style={[styles.thCell, { flex: 1, textAlign: 'right' }]}>Rate (₹)</Text>
                  <Text style={[styles.thCell, { flex: 1, textAlign: 'right' }]}>Total (₹)</Text>
                </View>

                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((item: IInvoiceListItem, idx: number) => (
                    <View key={idx} style={styles.tableRow}>
                      <View style={{ flex: 2, paddingRight: 4 }}>
                        <Text style={[styles.tdCell, { fontWeight: '600' }]}>{item.item_name}</Text>
                      </View>
                      <Text style={[styles.tdCell, { flex: 0.6, textAlign: 'center' }]}>
                        {item.qty}
                      </Text>
                      <Text style={[styles.tdCell, { flex: 1, textAlign: 'right' }]}>
                        {parseFloat(String(item.unit_price || 0)).toFixed(2)}
                      </Text>
                      <Text
                        style={[styles.tdCell, { flex: 1, textAlign: 'right', fontWeight: '700' }]}
                      >
                        {Number(item.amount || 0).toFixed(2)}
                      </Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.tableRow}>
                    <Text style={[styles.tdCell, { flex: 2, fontWeight: '600' }]}>
                      Consultation Fee
                    </Text>
                    <Text style={[styles.tdCell, { flex: 0.6, textAlign: 'center' }]}>1</Text>
                    <Text style={[styles.tdCell, { flex: 1, textAlign: 'right' }]}>
                      {calculations.grandTotalNum.toFixed(2)}
                    </Text>
                    <Text
                      style={[styles.tdCell, { flex: 1, textAlign: 'right', fontWeight: '700' }]}
                    >
                      {calculations.grandTotalNum.toFixed(2)}
                    </Text>
                  </View>
                )}
              </View>

              {/* Summary Totals */}
              <View style={styles.totalsBox}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Subtotal:</Text>
                  <Text style={styles.totalVal}>₹{calculations.subtotalNum.toFixed(2)}</Text>
                </View>

                {calculations.totalDiscountNum > 0 && (
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Discounts:</Text>
                    <Text style={[styles.totalVal, { color: theme.colors.success }]}>
                      - ₹{calculations.totalDiscountNum.toFixed(2)}
                    </Text>
                  </View>
                )}

                {(calculations.cgstNum > 0 || calculations.sgstNum > 0) && (
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>CGST (9%) + SGST (9%):</Text>
                    <Text style={styles.totalVal}>
                      ₹{(calculations.cgstNum + calculations.sgstNum).toFixed(2)}
                    </Text>
                  </View>
                )}

                {calculations.igstNum > 0 && (
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>IGST (18%):</Text>
                    <Text style={styles.totalVal}>₹{calculations.igstNum.toFixed(2)}</Text>
                  </View>
                )}

                <View style={styles.grandRow}>
                  <Text style={styles.grandLabel}>Amount Paid / Total:</Text>
                  <Text style={styles.grandVal}>₹{calculations.grandTotalNum.toFixed(2)}</Text>
                </View>
              </View>

              <View style={styles.footerSignatureRow}>
                <Text style={styles.footerNoteText}>
                  {invoice.notes ||
                    'Thank you for choosing our clinic. Wish you a healthy recovery!'}
                </Text>
              </View>
            </ScrollView>
          )}
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.btnPrimary}
              activeOpacity={0.85}
              onPress={() => {
                handleSavePDF();
              }}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <ActivityIndicator color="#FFFFFF" />
                  <Text style={styles.btnPrimaryTxt}>Downloading PDF...</Text>
                </>
              ) : (
                <>
                  <DownloadIcon size={16} color="#FFFFFF" strokeWidth={2.2} />
                  <Text style={styles.btnPrimaryTxt}>Download PDF</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    display: 'flex',
    flexDirection: 'column',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceBorder,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.dark,
  },
  closeBtn: {
    padding: 4,
  },
  paperScroll: {
    marginVertical: 12,
    flexGrow: 1,
    flexShrink: 1,
  },
  paperContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingBottom: 24,
  },
  paperHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clinicDetails: {
    flex: 1,
    paddingRight: 10,
  },
  paperClinicName: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  paperClinicSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  metaTag: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  invoiceBadgeBox: {
    alignItems: 'flex-end',
  },
  paperInvTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  paperInvNum: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
    marginTop: 2,
  },
  paperInvDate: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  paperDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  doctorInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  doctorName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  doctorSub: {
    fontSize: 11,
    color: theme.colors.textSlate,
    marginTop: 1,
  },
  billedToRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  labelTitle: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  patientName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  patientMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusTxt: {
    fontSize: 10,
    fontWeight: '800',
  },
  modeTxt: {
    fontSize: 10,
    color: '#64748B',
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  thCell: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tdCell: {
    fontSize: 12,
    color: '#1E293B',
  },
  totalsBox: {
    alignItems: 'flex-end',
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  totalVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
    width: 90,
    textAlign: 'right',
  },
  grandRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  grandLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  grandVal: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.primary,
    width: 95,
    textAlign: 'right',
  },
  footerSignatureRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 10,
  },
  footerNoteText: {
    flex: 1,
    fontSize: 10,
    fontStyle: 'italic',
    color: '#64748B',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 8,
  },
  btnPrimary: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnPrimaryTxt: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default InvoiceDetailsModal;
