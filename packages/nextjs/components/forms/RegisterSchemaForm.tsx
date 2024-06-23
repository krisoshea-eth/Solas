"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark/useScaffoldWriteContract";

const RegisterSchemaForm = () => {
  const [schema, setSchema] = useState<string>("");
  const [revocable, setRevocable] = useState<boolean>(false);
  const router = useRouter();

  const { writeAsync, isSuccess, isPending, isError } =
    useScaffoldWriteContract({
      contractName: "SchemaRegistry",
      functionName: "register",
      args: [schema, false],
    });

  const handleSubmit = async (formData: FormData) => {
    const schema = formData.get("schema") as string;
    const revocable = formData.get("revocable") as string;

    setSchema(schema);
    setRevocable(revocable === "true");
    try {
      await writeAsync({
        args: [schema, true],
      });
    } catch (err) {
      console.error("Error submitting transaction:", err);
    }
  };

  const LoadingSpinner = (
    <svg
      aria-hidden="true"
      className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
      viewBox="0 0 100 101"
      fill="none"
    >
      <path
        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
        fill="rgb(191 219 254)"
      />
      <path
        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
        fill="rgb(59 130 246)"
      />
    </svg>
  );

  return (
    <div className="">
      <h1 className="text-3xl text-[#495FA9] mb-4">Register Schema</h1>
      <form action={handleSubmit} className="rounded-lg space-y-4">
        <input
          type="text"
          name="schema"
          placeholder="Schema"
          required
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        />
        <span className="block text-sm text-gray-600">Revocable</span>
        <select
          name="revocable"
          required
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        >
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
        <button
          type="submit"
          className="w-full bg-[#495FA9] text-white py-2 px-4 rounded-lg hover:bg-[#475299]"
        >
          {isPending ? "Processing..." : "Register"}
        </button>
      </form>
      {isPending && (
        <div className="flex justify-center items-center mt-4">
          {LoadingSpinner}
        </div>
      )}
      {isSuccess && (
        <div className="mt-4 text-center text-green-600">
          Transaction confirmed. You will be redirected to your dashboard.
        </div>
      )}
      {isError && (
        <div className="mt-4 text-center text-red-600">
          Error submitting transaction.
        </div>
      )}
    </div>
  );
};

export default RegisterSchemaForm;
