let timer: ReturnType<typeof setTimeout> | undefined;

/** One toast at a time, shown by <ToastHost> in app.vue. */
export function useToast() {
  const message = useState('toast-message', () => '');
  const visible = useState('toast-visible', () => false);

  function show(text: string) {
    message.value = text;
    visible.value = true;
    clearTimeout(timer);
    timer = setTimeout(() => (visible.value = false), 2400);
  }

  return { message, visible, show };
}
