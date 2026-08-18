import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { theme } from '../../styled/theme.styled';
import { CircleXIcon } from './icons';

const ITEM_HEIGHT = 44;
const VISIBLE_ROWS = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ROWS;

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export type WheelDatePickerModalProps = {
  visible: boolean;
  value?: Date | null;
  maximumDate?: Date;
  minimumDate?: Date;
  title?: string;
  embedded?: boolean;
  onCancel: () => void;
  onConfirm: (date: Date) => void;
};

function clampDate(date: Date, min?: Date, max?: Date): Date {
  let d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (min && d < min) d = new Date(min.getFullYear(), min.getMonth(), min.getDate());
  if (max && d > max) d = new Date(max.getFullYear(), max.getMonth(), max.getDate());
  return d;
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

type WheelColumnProps = {
  data: Array<string | number>;
  selectedIndex: number;
  onChange: (index: number) => void;
};

const WheelColumn: React.FC<WheelColumnProps> = ({
  data,
  selectedIndex,
  onChange,
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const isScrolling = useRef(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        y: selectedIndex * ITEM_HEIGHT,
        animated: false,
      });
    });
    return () => cancelAnimationFrame(id);
  }, [selectedIndex, data.length]);

  const snapToNearest = (offsetY: number) => {
    const raw = Math.round(offsetY / ITEM_HEIGHT);
    const index = Math.max(0, Math.min(data.length - 1, raw));
    scrollRef.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: true });
    if (index !== selectedIndex) onChange(index);
  };

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    isScrolling.current = false;
    snapToNearest(e.nativeEvent.contentOffset.y);
  };

  return (
    <View style={styles.column}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        nestedScrollEnabled
        onScrollBeginDrag={() => {
          isScrolling.current = true;
        }}
        onMomentumScrollEnd={onScrollEnd}
        onScrollEndDrag={e => {
          if (!isScrolling.current) return;
          snapToNearest(e.nativeEvent.contentOffset.y);
        }}
        contentContainerStyle={{
          paddingVertical: ITEM_HEIGHT * Math.floor(VISIBLE_ROWS / 2),
        }}
      >
        {data.map((item, index) => {
          const active = index === selectedIndex;
          return (
            <View key={`${item}-${index}`} style={styles.item}>
              <Text style={[styles.itemText, active && styles.itemTextActive]}>
                {item}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export const WheelDatePickerModal: React.FC<WheelDatePickerModalProps> = ({
  visible,
  value,
  maximumDate,
  minimumDate,
  title = 'Date of Birth',
  embedded = false,
  onCancel,
  onConfirm,
}) => {
  const max = useMemo(() => maximumDate ?? new Date(), [maximumDate]);
  const min = useMemo(() => minimumDate ?? new Date(1900, 0, 1), [minimumDate]);

  const initial = useMemo(
    () => clampDate(value ? new Date(value) : new Date(2000, 0, 1), min, max),
    [visible]
  );

  const [year, setYear] = useState(initial.getFullYear());
  const [month, setMonth] = useState(initial.getMonth());
  const [day, setDay] = useState(initial.getDate());

  useEffect(() => {
    if (!visible) return;
    const seeded = clampDate(value ? new Date(value) : new Date(2000, 0, 1), min, max);
    setYear(seeded.getFullYear());
    setMonth(seeded.getMonth());
    setDay(seeded.getDate());
  }, [visible, value, min, max]);

  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = max.getFullYear(); y >= min.getFullYear(); y -= 1) list.push(y);
    return list;
  }, [min, max]);

  const maxDay = daysInMonth(year, month);
  const days = useMemo(() => Array.from({ length: maxDay }, (_, i) => i + 1), [maxDay]);

  useEffect(() => {
    if (day > maxDay) setDay(maxDay);
  }, [day, maxDay]);

  const yearIndex = Math.max(0, years.indexOf(year));
  const dayIndex = Math.max(0, Math.min(days.length - 1, day - 1));

  const handleConfirm = () => {
    const next = clampDate(new Date(year, month, day), min, max);
    onConfirm(next);
  };

  if (!visible) return null;

  const content = (
    <View style={[styles.overlay, embedded && styles.overlayEmbedded]}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onCancel} />
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onCancel} hitSlop={12} style={styles.closeBtn}>
            <CircleXIcon size={22} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.wheelWrap}>
          <View style={styles.selectionBand} pointerEvents="none" />
          <WheelColumn
            data={days}
            selectedIndex={dayIndex}
            onChange={i => setDay(days[i])}
          />
          <WheelColumn
            data={MONTHS}
            selectedIndex={month}
            onChange={i => setMonth(i)}
          />
          <WheelColumn
            data={years}
            selectedIndex={yearIndex}
            onChange={i => setYear(years[i])}
          />
        </View>

        <TouchableOpacity style={styles.doneBtn} onPress={handleConfirm} activeOpacity={0.85}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (embedded) return content;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      {content}
    </Modal>
  );
};

export default WheelDatePickerModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  overlayEmbedded: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 28 : 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelWrap: {
    height: WHEEL_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    marginVertical: 8,
  },
  selectionBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: ITEM_HEIGHT * Math.floor(VISIBLE_ROWS / 2),
    height: ITEM_HEIGHT,
    backgroundColor: theme.colors.primarySoft,
    borderRadius: 10,
    zIndex: 0,
  },
  column: {
    flex: 1,
    height: WHEEL_HEIGHT,
    zIndex: 1,
  },
  item: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    fontSize: 18,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  itemTextActive: {
    color: theme.colors.textPrimary,
    fontWeight: '700',
    fontSize: 20,
  },
  doneBtn: {
    marginTop: 12,
    height: 52,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
});
