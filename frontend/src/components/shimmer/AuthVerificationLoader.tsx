function AuthVerificationLoader({
  text = "Verifying your credentials...",
}: {
  text?: string;
}) {
  return (
    <div className="h-screen w-full  flex flex-col justify-center items-center gap-4 dark:bg-theme">
      <div className="w-10 h-10 border-4 border-orange-400 border-t-transparent border-solid rounded-full animate-spin"></div>
      <h1 className="text-xl text-gray-500 dark:text-gray-200">{text}</h1>
    </div>
  );
}

export default AuthVerificationLoader;
