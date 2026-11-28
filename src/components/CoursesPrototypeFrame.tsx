/** Separate document keeps prototype Tailwind resets, fonts and theme out of NetOps. */
export function CoursesPrototypeFrame() {
  return (
    <iframe
      title="Макет Курсы — три интерактивные концепции"
      src={`${import.meta.env.BASE_URL}courses-prototypes.html`}
      className="block w-full border-0 h-[calc(100dvh-9rem)] lg:h-[calc(100dvh-4rem)] min-h-[560px]"
    />
  );
}
