# PredCare Doctor – agent instructions

## Keyboard handling in form screens

Any screen with `TextInput`s inside a `ScrollView` must follow the pattern used in
`src/Features/Dashboard/InvoicesScreen/CreateInvoiceScreen.tsx`. That way the form stays
scrollable while the keyboard is open and the submit button can still be reached.

```tsx
<SafeAreaWrapper header={...}>
  <KeyboardAvoidingView style={styles.keyboardView} behavior="padding">
    <ScrollView
      style={{ flex: 1 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* form fields */}
      {/* submit button at the end of the content */}
    </ScrollView>
  </KeyboardAvoidingView>
</SafeAreaWrapper>
```

Rules:
- Use React Native's `KeyboardAvoidingView` with `behavior="padding"` on **both** iOS and Android. Android runs edge-to-edge (`edgeToEdgeEnabled=true`), so `adjustResize` alone doesn't keep the form scrollable. Don't write manual `Keyboard` listener / padding logic.
- `styles.keyboardView` is `{ flex: 1 }` in the screen's `.styled.ts` file.
- `KeyboardAvoidingView` goes directly inside `SafeAreaWrapper` and wraps the `ScrollView`.
- If the screen passes `header={<Header ... />}` to `SafeAreaWrapper`, the `KeyboardAvoidingView` sits below that header but measures itself relative to its parent. It then under-pads by the header height and the bottom of the form (e.g. the submit button) stays hidden behind the keyboard. Wrap it in a measured `View` and pass the on-screen top as `keyboardVerticalOffset` (see `BookAppointmentScreen.tsx`):
  ```tsx
  const formContainerRef = useRef<React.ComponentRef<typeof View>>(null);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  <View
    ref={formContainerRef}
    style={styles.keyboardView}
    onLayout={() => formContainerRef.current?.measureInWindow((_x, y) => setKeyboardOffset(y))}
  >
    <KeyboardAvoidingView style={styles.keyboardView} behavior="padding" keyboardVerticalOffset={keyboardOffset}>
      ...
    </KeyboardAvoidingView>
  </View>
  ```
  Screens that render their header inside the `KeyboardAvoidingView` (like `CreateInvoiceScreen.tsx`) don't need this.
- Bottom-sheet modals with inputs (e.g. `EMRUploadModal.tsx`): make the full-screen overlay (`flex: 1`, `justifyContent: 'flex-end'`, `paddingTop: insets.top`) the `KeyboardAvoidingView` with `behavior="padding"` (both platforms). Keep the sheet a plain `View` with `maxHeight` and its own safe-area `paddingBottom` (`insets.bottom + 16` when the keyboard is closed, a small gap when it's open; use `useKeyboardVisible()` from `src/hooks/commons/useKeyboardVisible.ts`). Don't make the sheet itself the `KeyboardAvoidingView`: its `paddingBottom` gets overridden to `0` and the sheet loses its bottom safe-area spacing. No offset is needed because the overlay starts at the top of the screen. While the keyboard is open, an outside tap / Android back should only `Keyboard.dismiss()`, not close the modal.
- Always set `keyboardShouldPersistTaps="handled"` on the `ScrollView` so the submit button responds on the first tap while the keyboard is open.
- Give the scroll content enough bottom padding that the last button isn't cut off.
- Reference implementations: `CreateInvoiceScreen.tsx`, `BookAppointmentScreen.tsx`, `CreatePrescriptionScreen.tsx`.

## Code style
- Put styles in the screen's `src/styled/*.styled.ts` file instead of inline objects.
- Don't run Prettier over a whole existing file; it reformats unrelated code (screens use mixed 2- and 4-space indentation). Edit only the lines you need.
