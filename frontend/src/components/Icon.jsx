const PATHS = {
  dashboard:         "M4 5h7v6H4zm9 0h7v4h-7zM4 13h7v6H4zm9-2h7v8h-7z",
  "arrow-left":      "M19 12H5m0 0 6-6m-6 6 6 6",
  check:             "M5 13l4 4L19 7",
  save:              "M5 4h11l3 3v13H5zM8 4v5h8M8 20v-6h8v6",
  plus:              "M12 5v14M5 12h14",
  helpers:           "M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5z",
  "helpers-active":  "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 8c0-2.8 3.1-5 7-5s7 2.2 7 5m0-10 2 2 4.5-4.5",
  roles:             "M12 3l7 3v5c0 4.4-3 8.5-7 10-4-1.5-7-5.6-7-10V6l7-3z",
  availability:      "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 4v6l4 2",
  skills:            "M12 3l2.8 5.7L21 9.6l-4.5 4.4 1.1 6.1L12 17.2 6.4 20.1 7.5 14 3 9.6l6.2-.9z",
  "helper-skills":   "M7 6h10M7 12h10M7 18h10M4 6h.01M4 12h.01M4 18h.01",
  experience:        "M4 8h16v10H4zM8 8V6h8v2",
  documents:         "M7 3h7l4 4v14H7zM14 3v5h5",
  "document-check":  "M7 3h7l4 4v14H7zM14 3v5h5m-8.5 9 2 2 3.5-3.5",
  employers:         "M4 10l8-6 8 6v10H4zM9 20v-6h6v6",
  "job-requests":    "M7 4h10v16H7zM9 8h6M9 12h6M9 16h4",
  folder:            "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z",
  assignments:       "M5 12h14M13 6l6 6-6 6",
  clipboard:         "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-3 8h4m-4 4h2",
  locations:         "M12 21s6-5.3 6-10a6 6 0 1 0-12 0c0 4.7 6 10 6 10zm0-8.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z",
  logout:            "M10 6V4h9v16h-9v-2M15 12H4m0 0 3-3m-3 3 3 3",
  workspace:         "M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z",
  secure:            "M12 3l7 3v5c0 4.4-3 8.5-7 10-4-1.5-7-5.6-7-10V6l7-3zm-1.5 9L8 9.5 9.4 8.1l2.1 2.1 4-4L17 7.5l-5.5 5.5z",
  target:            "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 4a6 6 0 1 0 0 12A6 6 0 0 0 12 6zm0 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",
};

export default function Icon({ name, size = 20 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      aria-hidden="true"
    >
      <path d={PATHS[name] || PATHS.dashboard} />
    </svg>
  );
}
