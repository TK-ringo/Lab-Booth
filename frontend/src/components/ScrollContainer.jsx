// frontend/src/components/ScrollContainer.jsx
export default function ScrollContainer({ header, children, footer }) {
  return (
    <div className="h-full flex flex-col">
      {header && <div className="flex-shrink-0 mb-2">{header}</div>}
      <div className="flex-1 overflow-x-auto overflow-y-auto">{children}</div>
      {footer && <div className="flex-shrink-0 mt-4">{footer}</div>}
    </div>
  );
}
