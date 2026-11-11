const Icon = ({ d, size = 24, ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" {...props}>
    <path d={d} />
  </svg>
);

export const MenuIcon = (p) => <Icon d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" {...p} />;
export const SearchIcon = (p) => (
  <Icon d="M15.5 14h-.8l-.3-.3A6.5 6.5 0 1 0 9.5 16a6.5 6.5 0 0 0 4.2-1.6l.3.3v.8l5 5 1.5-1.5-5-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z" {...p} />
);
export const HomeIcon = (p) => <Icon d="M4 10v11h6v-6h4v6h6V10l-8-7z" {...p} />;
export const FireIcon = (p) => (
  <Icon d="M13.5.7s.7 2.6.7 4.8c0 2-1.4 3.7-3.4 3.7S7.2 7.5 7.2 5.5V5.2C5.2 7.6 4 10.7 4 14a8 8 0 0 0 16 0c0-5.4-2.6-10.2-6.5-13.3zM11.7 19c-1.8 0-3.2-1.4-3.2-3.1 0-1.6 1-2.8 2.8-3.1 1.8-.4 3.6-1.2 4.6-2.6.4 1.3.6 2.6.6 4 0 2.7-2.1 4.8-4.8 4.8z" {...p} />
);
export const SubsIcon = (p) => (
  <Icon d="M20 7H4V5h16zm-2-6H6v2h12zm4 11v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2zm-6 4-6-3.3v6.6z" {...p} />
);
export const HistoryIcon = (p) => (
  <Icon d="M13 3a9 9 0 0 0-9 9H1l4 4 4-4H6a7 7 0 1 1 2 4.9l-1.4 1.4A9 9 0 1 0 13 3zm-1 5v5l4.3 2.5.7-1.2-3.5-2.1V8z" {...p} />
);
export const LikeIcon = (p) => (
  <Icon d="M1 21h4V9H1zm22-11a2 2 0 0 0-2-2h-6.3l1-4.6v-.3a1.5 1.5 0 0 0-.5-1L14.2 1 7.6 7.6A2 2 0 0 0 7 9v10a2 2 0 0 0 2 2h9c.8 0 1.5-.5 1.8-1.2l3-7.1c.1-.2.2-.5.2-.7z" {...p} />
);
export const DislikeIcon = (p) => (
  <Icon d="M15 3H6c-.8 0-1.5.5-1.8 1.2l-3 7.1c-.1.2-.2.5-.2.7v2a2 2 0 0 0 2 2h6.3l-1 4.6v.3c0 .4.2.8.5 1.1L9.8 23l6.6-6.6c.4-.4.6-.9.6-1.4V5a2 2 0 0 0-2-2zm4 0v12h4V3z" {...p} />
);
export const UploadIcon = (p) => (
  <Icon d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11zM14 13h-3v3H9v-3H6v-2h3V8h2v3h3z" {...p} />
);
export const VideosIcon = (p) => (
  <Icon d="M10 8v8l6-4zm11-5H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16H3V5h18z" {...p} />
);
export const LogoIcon = () => (
  <svg viewBox="0 0 28 20" width="30" height="21" aria-hidden="true">
    <rect width="28" height="20" rx="5" fill="#f00" />
    <path d="M11 5.5v9l8-4.5z" fill="#fff" />
  </svg>
);
