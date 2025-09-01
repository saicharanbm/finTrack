import { useGoogleLoginMutation } from "@/services/mutations";
import icon from "../assets/icon.png";
import { useGoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import { ToastStlye } from "@/utils";
function Login() {
  const { mutate: signin, isPending } = useGoogleLoginMutation();

  const googleLogin = useGoogleLogin({
    onSuccess: (response) => {
      console.log(response);
      toast.promise(
        new Promise<void>((resolve, reject) => {
          signin(response.code, {
            onSuccess: () => {
              // navigate("/login");
              resolve();
            },
            onError: (error) => {
              reject(error);
            },
          });
        }),
        {
          pending: "Setting things up, please wait…",
          success: "You’re all set! 🎉",
          error: {
            render({ data }: { data: string }) {
              console.log(data);
              return (
                (data as string) ||
                "Oops! Couldn’t complete signup. Please retry."
              );
            },
          },
        },
        ToastStlye
      );
    },
    onError: (error) => console.log(error),
    flow: "auth-code",
  });
  return (
    <div className="flex h-screen w-screen flex-col lg:flex-row">
      {/* Left Section */}
      <div className="flex flex-col items-center justify-center min-h-1/ bg-theme text-white p-10 pt-16 lg:w-1/2">
        <div className="bg-white rounded-full mb-6 overflow-hidden size-16">
          <img
            src={icon}
            alt=""
            className="w-full h-full object-cover object-center"
          />
        </div>
        <h1 className="text-3xl font-bold">FinTrack</h1>
        <p className="mt-2 text-lg opacity-80">Manage your finances smarter</p>
      </div>

      {/* Right Section */}
      <div className="flex flex-1 bg-theme lg:w-1/2 ">
        <div className="flex gap-12 flex-col items-center justify-center pt-16 p-10 text-center w-full bg-content-background  rounded-t-3xl lg:rounded-none">
          <p className=" max-w-sm text-xl lg:text-2xl lg:font-bold text-title">
            Track expenses, analyze spending patterns, and gain financial
            insights.
          </p>

          <div className="flex flex-col gap-4">
            {/* Google Button */}
            <button
              className=" flex w-64 items-center justify-center gap-2 rounded-full border-2 cursor-pointer border-gray-300 px-6 py-3  transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
              onClick={googleLogin}
              disabled={isPending}
            >
              <img
                src="https://www.svgrepo.com/show/355037/google.svg"
                alt="Google"
                className="h-5 w-5"
              />
              <span className="text-sm font-medium">Sign in with Google</span>
            </button>
            {/* Email Button */}
            <button
              className="w-64 rounded-full bg-theme px-6 py-3 cursor-pointer text-white shadow-md hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              onClick={googleLogin}
              disabled={isPending}
            >
              Sign up with Google
            </button>
          </div>
          <p className="mt-8 text-xs text-gray-500 lg:fixed lg:bottom-12">
            Your data is protected. Read our{" "}
            <span className="underline"> Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
