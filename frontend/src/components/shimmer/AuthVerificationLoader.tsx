function AuthVerificationLoader({
  text = "Verifying your credentials...",
}: {
  text?: string;
}) {
  return (
    <div className="h-screen w-full  flex flex-col justify-center items-center gap-4">
      <div className="w-10 h-10 border-4 border-theme border-t-transparent border-solid rounded-full animate-spin"></div>
      <h1 className="text-xl text-gray-500">{text}</h1>
    </div>
  );
}

export default AuthVerificationLoader;
