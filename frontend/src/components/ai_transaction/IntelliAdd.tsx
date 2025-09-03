import { useParsedTransactions } from "@/services/mutations";
import type { TransactionSchemaType } from "@/types";
import { SuccessTransactionDataSchema } from "@/types/zod";
import { cn } from "@/utils";
import { useState } from "react";
import ParsedTransactions from "./ParsedTransactions";

function IntelliAdd() {
  const { mutate: parseTransaction, isPending } = useParsedTransactions();
  const [userMessage, setUserMessage] = useState("");
  const [aiMessage, setAiMessage] = useState<{
    type: "error" | "incomplete";
    message: string;
  } | null>(null);

  const [parsedTransactions, setParsedTransactions] =
    useState<TransactionSchemaType[]>();

  const getParsedTransactions = async () => {
    if (!userMessage.trim()) {
      setAiMessage({
        type: "error",
        message: "your query cant be empty",
      });
      return;
    }
    parseTransaction(userMessage, {
      onSuccess: ({ data }) => {
        console.log("parsed data :", data);
        try {
          if (data.type === "success") {
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
        setAiMessage({
          type: "error",
          message: error.message,
        });
      },
    });
  };

  return (
    <div className=" flex-1 flex flex-col  gap-14 p-6 overflow-y-scroll">
      <div className="w-full">
        <h1 className="text-2xl font-bold">Parse Your tansactions with AI</h1>
      </div>
      <div className="w-full bg-card-background border border-card-border flex gap-4 flex-col p-4 rounded-2xl shadow-md">
        <div className="w-full flex flex-col">
          <textarea
            className="bg-gray-100 dark:bg-background h-42 text-title border border-card-border focus:outline-none rounded-md p-2 shadow-input disabled:opacity-50 disabled:cursor-not-allowed"
            value={userMessage}
            disabled={
              isPending || (parsedTransactions && parsedTransactions.length > 0)
            }
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
            className="bg-[#1566e7]  text-white px-4 py-2 rounded-full shadow-input cursor-pointer  hover:shadow-lg font-medium"
            onClick={getParsedTransactions}
            disabled={
              isPending || (parsedTransactions && parsedTransactions.length > 0)
            }
          >
            Parse
          </button>
        </div>
      </div>

      {parsedTransactions && parsedTransactions.length > 0 && (
        <ParsedTransactions
          parsedTransactions={parsedTransactions}
          setUserMessage={setUserMessage}
          setParsedTransactions={setParsedTransactions}
          setAiMessage={setAiMessage}
        />
      )}
    </div>
  );
}

export default IntelliAdd;
