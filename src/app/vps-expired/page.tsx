export const metadata = {
  title: "VPS subscription expired",
};

export default function VpsExpiredPage() {
  return (
    <main className="min-h-screen bg-[#f7f8fb]">
      <img
        src="/mock-expired.png"
        alt="VPS subscription expired"
        className="h-screen w-screen object-cover"
      />
    </main>
  );
}
