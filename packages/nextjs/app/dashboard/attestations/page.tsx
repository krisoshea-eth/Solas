"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { fetchAllAttestations, fetchStats, shortAddress } from "~~/utils/utils";
import Modal from "~~/components/Modal";
import CreateAttestationForm from "~~/components/forms/CreateAttestationForm";
const Dashboard = () => {
  const [attestations, setAttestations] = useState<any[]>([]);
  const [stats, setStats] = useState<{
    totalAtestations: number;
    totalSchemas: number;
    totalAttestors: number;
  }>({
    totalAtestations: 0,
    totalSchemas: 0,
    totalAttestors: 0,
  });

  const getAttestations = async () => {
    try {
      const attestationData = await fetchAllAttestations();
      const stats = await fetchStats();
      setAttestations(attestationData);
      setStats(stats);
    } catch (error) {
      console.error("Error fetching attestations:", error);
    }
  };

  const AttestationLink = ({ uid }: { uid: string }) => (
    <Link href={`/dashboard/attestation/${uid}`} className="text-[#495FA9]">
      {shortAddress(uid)}
    </Link>
  );

  const DashboardStats = ({
    totalAtestations,
    totalSchemas,
    totalAttestors,
  }: {
    totalAtestations: number;
    totalSchemas: number;
    totalAttestors: number;
  }) => (
    <div className="flex justify-around mb-6">
      <div className="text-center">
        <div className="text-3xl font-bold text-[#495FA9]">
          {totalAtestations}
        </div>
        <div className="text-gray-600">Total Attestations</div>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold text-[#495FA9]">{totalSchemas}</div>
        <div className="text-gray-600">Total Schemas</div>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold text-[#495FA9]">
          {totalAttestors}
        </div>
        <div className="text-gray-600">Total Attestors</div>
      </div>
    </div>
  );

  useEffect(() => {
    getAttestations();
  }, []);
  return (
    <div>
      <div className="p-4 bg-[#E9E9F6]">
        <div className=" p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#495FA9]">
                Attestation Scan
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
                  Make Attestation
                </button>
              )}
            >
              <CreateAttestationForm />
            </Modal>
          </div>
          <DashboardStats
            totalAtestations={stats.totalAtestations}
            totalSchemas={stats.totalSchemas}
            totalAttestors={stats.totalAttestors}
          />
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="px-4 py-2 text-[#495FA9]">UID</th>
                  <th className="px-4 py-2 text-[#495FA9]">Schema</th>
                  <th className="px-4 py-2 text-[#495FA9]">From</th>
                  <th className="px-4 py-2 text-[#495FA9]">To</th>
                  <th className="px-4 py-2 text-[#495FA9]">Type</th>
                  <th className="px-4 py-2 text-[#495FA9]">Age</th>
                </tr>
              </thead>
              <tbody>
                {attestations.map((attestation) => (
                  <tr key={attestation.uid} className="border-b">
                    <td className="px-4 py-2">
                      <AttestationLink uid={attestation.uid} />
                    </td>
                    <td className="px-4 py-2 text-[#495FA9]">
                      {attestation.schema}
                    </td>
                    <td className="px-4 py-2 text-[#495FA9]">
                      {attestation.from}
                    </td>
                    <td className="px-4 py-2 text-[#495FA9]">
                      {attestation.to}
                    </td>
                    <td className="px-4 py-2 text-[#495FA9]">
                      {attestation.type}
                    </td>
                    <td className="px-4 py-2 text-[#495FA9]">
                      {attestation.age}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-center">
            <a className="text-blue-600" href="/attestations">
              View all attestations
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
