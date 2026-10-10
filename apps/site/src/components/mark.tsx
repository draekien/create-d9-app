export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 53 54"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={`inline-block h-[0.85em] w-auto align-[-0.1em] ${className ?? ""}`}
    >
      <path d="M0,0 H6.012 L29.023,58 H22.911 Z" />
      <path d="M22.852,0 H28.864 L51.875,58 H45.763 Z" />
    </svg>
  )
}

export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 79.838 54"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        d="M2055.782,114.819h6.012l23.011,58h-6.112Z"
        transform="translate(-2032.93 -114.819)"
      />
      <path
        d="M0,27.771H0V21.239l13.175-7.353L0,6.532V0L24.877,13.886,0,27.771Z"
        transform="translate(54.961 0)"
      />
      <path
        d="M2055.782,114.819h6.012l23.011,58h-6.112Z"
        transform="translate(-2055.782 -114.819)"
      />
    </svg>
  )
}
