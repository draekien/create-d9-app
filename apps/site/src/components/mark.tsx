export function Mark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 44"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M0 0h8l14 44h-8z" />
      <path d="M14 0h8l14 44h-8z" />
      <path d="M40 1l23 10.5L40 22v-6l11-4.5L40 7z" />
    </svg>
  )
}
