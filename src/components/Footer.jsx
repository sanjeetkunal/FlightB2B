export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 mt-10">
      <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm">
        © {new Date().getFullYear()} Flight Booker. All rights reserved.
      </div>
    </footer>
  );
}
