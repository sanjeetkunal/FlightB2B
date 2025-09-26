import FromToBar from "./FromToBar";

export default function HomeHero() {
  const onSearch = (payload) => {
    console.log("SEARCH →", payload);
    alert(`Searching...\n${JSON.stringify(payload, null, 2)}`);
  };

  return (
    <section className="max-w-[90rem] mx-auto px-4 py-7">
      <div className="rounded-[22px] shadow-[0_20px_50px_-5px_rgba(0,0,0,0.25)] p-4 bg-white">
        <FromToBar onSearch={onSearch} />
      </div>
    </section>
  );
}
