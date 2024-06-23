"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchAttestation, Attestation } from "~~/utils/utils";

export default function AttestationPage({
  params,
}: {
  params: { uid: string };
}) {
  const uid = params.uid;
  const [attestation, setAttestation] = useState<Attestation | null>(null);

  useEffect(() => {
    console.log("UUID:", uid);
    if (uid) {
      fetchAttestation(uid)
        .then((data) => {
          console.log("Fetched data:", data);
          setAttestation(data);
        })
        .catch((error) => {
          console.error("Error fetching attestation:", error);
        });
    }
  }, [uid]);

  if (!attestation) {
    return <div>Loading...</div>;
  }

  return (
    <div className="attestation-container p-6 shadow-md rounded-lg bg-[#E9E9F6]">
      <div className="mb-4">
        <span className="block text-sm text-gray-600">UID:</span>
        <span className="block text-lg font-semibold text-gray-600">
          {attestation.uid}
        </span>
      </div>
      <div className="border rounded-md overflow-hidden">
        <table className="min-w-full bg-white">
          <tbody>
            <tr className="border-b">
              <td className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50">
                Schema
              </td>
              <td className="px-4 py-2 text-sm text-gray-900">
                {attestation.schema}
              </td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50">
                Is Endorsement
              </td>
              <td className="px-4 py-2 text-sm text-gray-900">
                {attestation.isEndorsement ? "True" : "False"}
              </td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50">
                Name
              </td>
              <td className="px-4 py-2 text-sm text-gray-900">
                {attestation.name}
              </td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50">
                Domain
              </td>
              <td className="px-4 py-2 text-sm text-gray-900">
                {attestation.domain}
              </td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50">
                Context
              </td>
              <td className="px-4 py-2 text-sm text-gray-900">
                {attestation.context}
              </td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50">
                IPFS Hash
              </td>
              <td className="px-4 py-2 text-sm text-gray-900">
                <a href={attestation.ipfsHash} className="text-blue-500">
                  {attestation.ipfsHash}
                </a>
              </td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50">
                From
              </td>
              <td className="px-4 py-2 text-sm text-gray-900">
                {attestation.from}
              </td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50">
                To
              </td>
              <td className="px-4 py-2 text-sm text-gray-900">
                {attestation.to}
              </td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50">
                Created
              </td>
              <td className="px-4 py-2 text-sm text-gray-900">
                {attestation.created}
              </td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50">
                Expiration
              </td>
              <td className="px-4 py-2 text-sm text-gray-900">
                {attestation.expiration}
              </td>
            </tr>
            <tr>
              <td className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50">
                Revoked
              </td>
              <td className="px-4 py-2 text-sm text-gray-900">
                {attestation.revoked}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
