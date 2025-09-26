export default function FieldShell({ label, children }) {
  return (
    <div className="relative">
      <span className="absolute -top-2 left-3 text-[11px] px-2 py-[2px] rounded-full
                        border border-gray-400  shadow-sm select-none bg-white">
        {label}
      </span>

      <div className="bg-gray-100 rounded-xl h-[56px] flex items-center px-3 
                      ring-1 ring-transparent focus-within:ring-2 focus-within:ring-blue-500 cursor-pointer">
        {children}
      </div>
    </div>
  );
}
