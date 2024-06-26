"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-stark/useScaffoldEventHistory";
import Modal from "~~/components/Modal";
import CreateAttestationForm from "~~/components/forms/CreateAttestationForm";

const Attestations = () => {
  const [totalAttestations, setTotalAttestations] = useState<number>(0);
  const [attestations, setAttestations] = useState<any[]>([]);

  const {
    data: eventData,
    isLoading,
    error: err,
  } = useScaffoldEventHistory({
    contractName: "AttestationRegistry",
    eventName: "contracts::AttestationRegistry::AttestationRegistry::Attested",
    fromBlock: BigInt(0),
    blockData: true,
    transactionData: false,
    receiptData: false,
    watch: true,
    enabled: true,
  });

  /*   struct Attested {
    #[key]
    recipient: ContractAddress,
    #[key]
    attester: ContractAddress,
    uid: u128,
    #[key]
    schema_uid: u128,
    timestamp: u64,
}
 */
  useEffect(() => {
    if (eventData) {
      console.log(eventData);
      setTotalAttestations(eventData.length);
      setAttestations(
        eventData.map((event) => ({
          recipient: event.args.recipient,
          attester: event.args.attester,
          uid: event.args.uid,
          schema: event.args.schema_uid,
          timestamp: event.args.timestamp,
        }))
      );
    }
  }, [eventData]);

  const AttestationLink = ({ uid }: { uid: string }) => (
    <Link href={`/dashboard/attestation/${uid}`} className="text-[#495FA9]">
      {uid.toString()}
    </Link>
  );

  const DashboardStats = ({
    totalAttestations,
  }: {
    totalAttestations: number;
  }) => (
    <div className="flex justify-around mb-6">
      <div className="text-center">
        <div className="text-3xl font-bold text-[#495FA9]">
          {totalAttestations}
        </div>
        <div className="text-gray-600">Total Attestations</div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="p-4 bg-[#E9E9F6]  min-h-screen">
        <div className="p-6 rounded-lg ">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#495FA9]">
                Solas Attestations
              </h1>
              <p className="text-gray-600">
                Showing the most recent Solas Attestations.
              </p>
            </div>

            <Modal
              trigger={({ openModal }) => (
                <button
                  className="bg-[#F5A162] text-white px-4 py-2 rounded-lg"
                  onClick={openModal}
                >
                  Make Attestations
                </button>
              )}
            >
              <CreateAttestationForm />
            </Modal>
          </div>
          <DashboardStats totalAttestations={totalAttestations} />
          {isLoading ? (
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
              <p className="text-[#495FA9]">Loading all the attestations...</p>
            </div>
          ) : (
            <div>
              <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100 border-b">
                      <th className="px-4 py-2 text-[#495FA9]">UID</th>
                      <th className="px-4 py-2 text-[#495FA9]">Attester</th>
                      <th className="px-4 py-2 text-[#495FA9]">Recipient</th>
                      <th className="px-4 py-2 text-[#495FA9]">Schema UID</th>
                      <th className="px-4 py-2 text-[#495FA9]">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attestations.map((schema, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-4 py-2">
                          <AttestationLink uid={schema.uid} />
                        </td>
                        <td className="px-4 py-2 text-[#495FA9]">
                          {schema.attester}
                        </td>
                        <td className="px-4 py-2 text-[#495FA9]">
                          {schema.recipient}
                        </td>
                        <td className="px-4 py-2 text-[#495FA9]">
                          {schema.schema}
                        </td>
                        <td className="px-4 py-2 text-[#495FA9]">
                          {schema.timestamp}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-center">
                <a className="text-[#495FA9]" href="/attestations">
                  View all attestations
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attestations;
