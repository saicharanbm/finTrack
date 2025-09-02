import {
  useCreateTransactionMutation,
  useParsedTransactions,
} from "@/services/mutations";
import type {
  TransactionsType,
  TransactionSchemaType,
  CategoriesType,
} from "@/types";
import { SuccessTransactionDataSchema } from "@/types/zod";
import { cn } from "@/utils";
import { useState } from "react";
const categories: CategoriesType[] = [
  "FOOD",
  "TRANSPORT",
  "ENTERTAINMENT",
  "SHOPPING",
  "UTILITIES",
  "HEALTHCARE",
  "EDUCATION",
  "TRAVEL",
  "GROCERIES",
  "RENT",
  "SALARY",
  "FREELANCE",
  "INVESTMENT",
  "GIFT",
  "OTHER",
];

function IntelliAdd() {
  const { mutate: parseTransaction, isPending } = useParsedTransactions();
  const [userMessage, setUserMessage] = useState("");
  const [aiMessage, setAiMessage] = useState<{
    type: "error" | "incomplete";
    message: string;
  } | null>(null);

  const [parsedTransactions, setParsedTransactions] =
    useState<TransactionSchemaType[]>();

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<TransactionSchemaType | null>(null);
  const { mutate: createTransaction, isPending: creatingTransaction } =
    useCreateTransactionMutation();

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

  const handleEdit = (index: number) => {
    if (parsedTransactions && parsedTransactions[index]) {
      setEditingIndex(index);
      setEditForm({ ...parsedTransactions[index] });
    }
  };
  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditForm(null);
  };

  const handleSaveEdit = () => {
    if (editForm && editingIndex !== null && parsedTransactions) {
      const updatedTransactions = [...parsedTransactions];
      updatedTransactions[editingIndex] = editForm;
      setParsedTransactions(updatedTransactions);
      setEditingIndex(null);
      setEditForm(null);
    }
  };

  const handleSaveTransactions = async () => {
    if (!parsedTransactions) return;
    const data =
      parsedTransactions.length == 1
        ? parsedTransactions[0]
        : parsedTransactions;
    createTransaction(data, {
      onSuccess: (data) => {
        // After successful save, reset states
        setParsedTransactions(undefined);
        setUserMessage("");
        setAiMessage(null);
        console.log("success", data);
      },
      onError: (error) => {
        console.log("something went wrong ", error);
      },
    });
  };

  const handleCancel = () => {
    setParsedTransactions(undefined);
    setUserMessage("");
    setAiMessage(null);
    setEditingIndex(null);
    setEditForm(null);
  };
  const formatAmount = (amountPaise: number) => {
    return `₹${(amountPaise / 100).toFixed(2)}`;
  };
  const updateEditForm = (
    field: keyof TransactionSchemaType,
    value: unknown
  ) => {
    if (editForm) {
      setEditForm({
        ...editForm,
        [field]: value,
      });
    }
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

      {/* {parsedTransactions && parsedTransactions.length !== 0 && (
        <div className="w-full bg-card-background border border-card-border flex gap-4 flex-col p-4 rounded-2xl shadow-md"></div>
      )} */}

      {parsedTransactions && parsedTransactions.length > 0 && (
        <div className="w-full space-y-4">
          {parsedTransactions.map((transaction, index) => (
            <div
              key={index}
              className="w-full bg-card-background border border-card-border p-4 rounded-2xl shadow-md"
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-title">
                  {editingIndex === index ? (
                    <input
                      type="text"
                      value={editForm?.title || ""}
                      onChange={(e) => updateEditForm("title", e.target.value)}
                      className="bg-gray-100 dark:bg-background border border-card-border rounded px-2 py-1"
                    />
                  ) : (
                    transaction.title
                  )}
                </h3>
                {editingIndex !== index ? (
                  <button
                    onClick={() => handleEdit(index)}
                    className="text-blue-500 hover:text-blue-700 px-2 py-1 rounded text-sm"
                  >
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="text-green-500 hover:text-green-700 px-2 py-1 rounded text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="text-gray-500 hover:text-gray-700 px-2 py-1 rounded text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Card Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 block">
                    Amount
                  </span>
                  {editingIndex === index ? (
                    <input
                      type="number"
                      value={
                        editForm ? (editForm.amountPaise / 100).toString() : "0"
                      }
                      onChange={(e) =>
                        updateEditForm(
                          "amountPaise",
                          Math.round(Number(e.target.value) * 100)
                        )
                      }
                      className="bg-gray-100 dark:bg-background border border-card-border rounded px-2 py-1 w-full"
                      step="0.01"
                      min="0"
                    />
                  ) : (
                    <span className="text-title font-medium">
                      {formatAmount(transaction.amountPaise)}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 block">
                    Type
                  </span>
                  {editingIndex === index ? (
                    <select
                      value={editForm?.type || "EXPENSE"}
                      onChange={(e) =>
                        updateEditForm(
                          "type",
                          e.target.value as TransactionsType
                        )
                      }
                      className="bg-gray-100 dark:bg-background border border-card-border rounded px-2 py-1 w-full"
                    >
                      <option value="EXPENSE">EXPENSE</option>
                      <option value="INCOME">INCOME</option>
                    </select>
                  ) : (
                    <span
                      className={cn(
                        "inline-block px-2 py-1 rounded-full text-xs font-medium",
                        transaction.type === "INCOME"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      )}
                    >
                      {transaction.type}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 block">
                    Category
                  </span>
                  {editingIndex === index ? (
                    <select
                      value={editForm?.category || "OTHER"}
                      onChange={(e) =>
                        updateEditForm("category", e.target.value)
                      }
                      className="bg-gray-100 dark:bg-background border border-card-border rounded px-2 py-1 w-full"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-title font-medium">
                      {transaction.category}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 block">
                    Date
                  </span>
                  {editingIndex === index ? (
                    <input
                      type="date"
                      value={
                        editForm?.date
                          ? editForm.date.split("/").reverse().join("-")
                          : ""
                      }
                      max={new Date().toISOString().split("T")[0]} // <-- prevents future dates
                      onChange={(e) => {
                        const [year, month, day] = e.target.value.split("-");
                        const formattedDate = `${day}/${month}/${year}`;
                        updateEditForm("date", formattedDate);
                      }}
                      className="bg-gray-100 dark:bg-background border border-card-border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    <span className="text-title font-medium">
                      {transaction.date || "No date"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              onClick={handleCancel}
              disabled={creatingTransaction}
              className="px-6 py-2 rounded-full border border-gray-300 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              disabled={creatingTransaction}
              onClick={handleSaveTransactions}
              className="bg-[#3164B8] text-white px-6 py-2 rounded-full shadow-input"
            >
              Save Transactions
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default IntelliAdd;
