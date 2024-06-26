"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Attestation, decodePendingWord, timeAgo } from "~~/utils/utils";
import { useScaffoldReadContract } from "~~/hooks/scaffold-stark/useScaffoldReadContract";

export default function AttestationPage({
  params,
}: {
  params: { uid: number };
}) {
  const uid = params.uid;
  const [attestation, setAttestation] = useState<any | null>(null);

  const {
    data: fetchedAttestation,
    isLoading,
    isSuccess,
    isError,
  } = useScaffoldReadContract({
    contractName: "AttestationRegistry",
    functionName: "get_attestation",
    args: [uid],
    watch: true,
    enabled: true,
  });

  useEffect(() => {
    if (isSuccess && fetchedAttestation) {
      console.log("Fetched Attestation:", fetchedAttestation);
      // Check if fetchedAttestation is an object
      const rawAttestation = fetchedAttestation as any;
      const mappedAttestation: Attestation = {
        attester: `0x` + rawAttestation.attester.toString(16),
        data: {
          data: decodePendingWord(
            rawAttestation.data.pending_word,
            rawAttestation.data.pending_word_len,
          ),
        },
        recipient: `0x` + rawAttestation.recipient.toString(16),
        revocable: rawAttestation.revocable.toString(),
        revocation_time: rawAttestation.revocation_time.toString(),
        schema_uid: rawAttestation.schema_uid.toString(),
        time: timeAgo(rawAttestation.time.toString()),
        uid: rawAttestation.uid.toString(),
      };
      console.log("Mapped Attestation:", mappedAttestation);
      setAttestation(mappedAttestation);
    }
  }, [isSuccess, isError, fetchedAttestation]);

  return (
    <div>
      <div className="p-4 bg-[#E9E9F6]  min-h-screen">
        <div className="p-6 rounded-lg ">
          {isLoading || !attestation ? (
            <div className="flex justify-center items-center flex-col mt-24">
              {" "}
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
              <p className="text-[#495FA9]">
                Loading the attestation details...
              </p>
            </div>
          ) : (
            <div className="attestation-container p-6  rounded-lg bg-[#E9E9F6]">
              <div className="mb-4">
                <span className="block text-sm text-gray-600">UID:</span>
                <span className="block text-lg font-semibold text-gray-600">
                  {attestation.uid}
                </span>
              </div>
              <div className="border rounded-md overflow-hidden shadow-md">
                <table className="min-w-full bg-white">
                  <tbody>
                    <tr className="border-b">
                      <td className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50">
                        Schema UID
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {attestation.schema_uid}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50">
                        Is Revocable
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {!!attestation.revocable ? "True" : "False"}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50">
                        Data
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {attestation.data.data}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50">
                        From
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {attestation.attester}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50">
                        To
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {attestation.recipient}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50">
                        Created
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {attestation.time}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50">
                        Expiration
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {attestation.revocation_time}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
