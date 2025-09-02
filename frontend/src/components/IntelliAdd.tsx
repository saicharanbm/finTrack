import { useParsedTransactions } from "@/services/mutations";
import type { SuccessParseSchema } from "@/types";
import { SuccessTransactionDataSchema } from "@/types/zod";
import { cn } from "@/utils";
import { useState } from "react";

function IntelliAdd() {
  const { mutate, isPending } = useParsedTransactions();
  const [userMessage, setUserMessage] = useState("");
  const [aiMessage, setAiMessage] = useState<{
    type: "error" | "incomplete";
    message: string;
  } | null>(null);

  const [parsedTransactions, setParsedTransactions] =
    useState<SuccessParseSchema[]>();

  const getParsedTransactions = async () => {
    if (!userMessage.trim()) {
      setAiMessage({ type: "error", message: "your query cant be empty" });

      return;
    }
    mutate(userMessage, {
      onSuccess: ({ data }) => {
        console.log("parsed data :", data);

        try {
          if (data.type == "success") {
            SuccessTransactionDataSchema.parse(data?.data);
            setParsedTransactions(data.data);
            setAiMessage(null);
          } else {
            console.log("message ", data.message);
            setAiMessage({
              type: "incomplete",
              message: data?.message ?? "Please provide all the details",
            });
          }
        } catch (error) {
          console.log(error);
          setAiMessage({
            type: "error",
            message: "Response parsing failed please try again.",
          });
        }
      },
      onError: (error) => {
        console.log("error :", error);
        setAiMessage({ type: "error", message: error.message });
      },
    });
  };
  return (
    <div className=" flex-1 flex flex-col  gap-14 p-6 overflow-y-scroll">
      <div className="w-full">
        <span className=" dark:text-slate-300  text-xl font-semibold ">
          Parse Your tansactions with AI
        </span>
      </div>
      <div className="w-full bg-card-background border border-card-border flex gap-4 flex-col p-4 rounded-2xl shadow-md">
        <div className="w-full flex flex-col">
          <textarea
            className="bg-gray-100 dark:bg-background h-42 text-title border border-card-border focus:outline-none rounded-md p-2 shadow-input"
            value={userMessage}
            disabled={isPending}
            onChange={(e) => {
              setUserMessage(e.target.value);
            }}
          />
          {aiMessage && (
            <span
              className={cn(
                " p-2",
                aiMessage.type === "error" ? "text-red-500" : "text-orange-400"
              )}
            >
              <span className="font-bold pr-1">{aiMessage.type} :</span>
              {aiMessage.message}
            </span>
          )}
        </div>

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

      {parsedTransactions && parsedTransactions.length !== 0 && (
        <div className="w-full bg-card-background border border-card-border flex gap-4 flex-col p-4 rounded-2xl shadow-md"></div>
      )}
    </div>
  );
}

export default IntelliAdd;
