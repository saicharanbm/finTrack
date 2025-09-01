import { useParsedTransactions } from "@/services/mutations";
import { useState } from "react";

function IntelliAdd() {
  const { mutate, isPending } = useParsedTransactions();
  const [userMessage, setUserMessage] = useState("");

  const getParsedTransactions = async () => {
    if (!userMessage.trim()) return;
    mutate(userMessage, {
      onSuccess: (data) => {
        console.log("parsed data :", data);
      },
      onError: (error) => {
        console.log("error :", error);
      },
    });
  };
  return (
    <div className=" flex-1 flex flex-col  gap-14 p-6 overflow-y-scroll">
      <div className="w-full">
        <span className=" dark:text-slate-300 font-mono lg:text-xl lg:font-semibold ">
          Parse Your tansactions with AI
        </span>
      </div>
      <div className="w-full bg-card-background border border-card-border flex gap-4 flex-col p-4 rounded-2xl shadow-md">
        <textarea
          className="bg-gray-100 dark:bg-background h-42 text-title border border-card-border focus:outline-none rounded-md p-2 shadow-input"
          value={userMessage}
          disabled={isPending}
          onChange={(e) => {
            setUserMessage(e.target.value);
          }}
        />

        <div className="flex justify-end">
          <button
            className="bg-[#3164B8] text-white px-4 py-2 rounded-full  shadow-input"
            onClick={getParsedTransactions}
            disabled={isPending}
          >
            Parse
          </button>
        </div>
      </div>
    </div>
  );
}

export default IntelliAdd;
