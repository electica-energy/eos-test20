@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: light;
}

body {
  @apply bg-slate-50 text-slate-900;
}

/* Subtle animated background layer */
.bg-animated {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: -1;
}

.bg-animated::before {
  content: "";
  position: absolute;
  width: 60vw;
  height: 60vw;
  left: -10vw;
  top: -10vw;
  background: radial-gradient(circle at center, rgba(14, 165, 233, 0.25), transparent 60%);
  filter: blur(12px);
  animation: bg-flow 40s ease-in-out infinite alternate;
}

.bg-animated::after {
  content: "";
  position: absolute;
  width: 70vw;
  height: 70vw;
  right: -20vw;
  bottom: -20vw;
  background: radial-gradient(circle at center, rgba(34, 197, 94, 0.18), transparent 60%);
  filter: blur(16px);
  animation: bg-flow 55s ease-in-out infinite alternate-reverse;
}

@keyframes bg-flow {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(-5%, -5%, 0) scale(1.08);
  }
  100% {
    transform: translate3d(4%, 4%, 0) scale(1);
  }
}

/* Simple scrollbars */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(148, 163, 184, 0.7);
  border-radius: 999px;
}
