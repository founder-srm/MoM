export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-sky-50 dark:from-slate-950 dark:via-indigo-950/20 dark:to-slate-950">
      {children}
    </div>
  );
}
