"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { fetchAllSchemas, fetchStats, shortAddress } from "~~/utils/utils";
import Modal from "~~/components/Modal";
import RegisterSchemaForm from "~~/components/forms/RegisterSchemaForm";
const Dashboard = () => {
  const [schemas, setSchemas] = useState<any[]>([]);
  const [stats, setStats] = useState<{
    totalAtestations: number;
    totalSchemas: number;
    totalAttestors: number;
  }>({
    totalAtestations: 0,
    totalSchemas: 0,
    totalAttestors: 0,
  });

  const getAllSchemas = async () => {
    try {
      const schemaData = await fetchAllSchemas();
      const stats = await fetchStats();
      setSchemas(schemaData);
      setStats(stats);
    } catch (error) {
      console.error("Error fetching schemas:", error);
    }
  };

  const SchemaLink = ({ uid }: { uid: string }) => (
    <Link href={`/dashboard/schema/${uid}`} className="text-[#495FA9]">
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
        <div className="text-gray-600">Total Schemas</div>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold text-[#495FA9]">{totalSchemas}</div>
        <div className="text-gray-600">Total Schemas</div>
      </div>
    </div>
  );

  useEffect(() => {
    getAllSchemas();
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
                Showing the most recent Solas Schemas.
              </p>
            </div>

            <Modal
              trigger={({ openModal }) => (
                <button
                  className="bg-[#F5A162] text-white px-4 py-2 rounded-lg"
                  onClick={openModal}
                >
                  Register Schema
                </button>
              )}
            >
              <RegisterSchemaForm />
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
                  <th className="px-4 py-2 text-[#495FA9]">Attestations</th>
                </tr>
              </thead>
              <tbody>
                {schemas.map((schema) => (
                  <tr key={schema.uid} className="border-b">
                    <td className="px-4 py-2">
                      <SchemaLink uid={schema.uid} />
                    </td>
                    <td className="px-4 py-2 text-[#495FA9]">
                      {schema.schema}
                    </td>
                    <td className="px-4 py-2 text-[#495FA9]">
                      {schema.attestations}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-center">
            <a className="text-blue-600" href="/attestations">
              View all schemas
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
